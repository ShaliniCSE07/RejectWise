/**
 * RejectWise - Calculations Engine
 * Pure mathematical, statistical and evaluation functions for water monitoring.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.calculations = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function round(val, decimals) {
    if (val == null || isNaN(val)) return null;
    var d = decimals != null ? decimals : 1;
    var factor = Math.pow(10, d);
    return Math.round(val * factor) / factor;
  }

  function calculateRecovery(purified, feed) {
    var p = parseFloat(purified);
    var f = parseFloat(feed);
    if (isNaN(p) || isNaN(f) || f <= 0 || p < 0) return null;
    return round((p / f) * 100, 1);
  }

  function calculateRejectFraction(reject, feed) {
    var r = parseFloat(reject);
    var f = parseFloat(feed);
    if (isNaN(r) || isNaN(f) || f <= 0 || r < 0) return null;
    return round((r / f) * 100, 1);
  }

  function calculateBalanceDifference(feed, purified, reject) {
    var f = parseFloat(feed);
    var p = parseFloat(purified);
    var r = parseFloat(reject);
    if (isNaN(f) || isNaN(p) || isNaN(r)) return null;
    var diff = f - p - r;
    return Math.abs(diff) < 0.001 ? 0 : round(diff, 2);
  }

  function calculateTankFill(currentVolume, capacity) {
    var vol = parseFloat(currentVolume);
    var cap = parseFloat(capacity);
    if (isNaN(vol) || isNaN(cap) || cap <= 0 || vol < 0) return null;
    var pct = (vol / cap) * 100;
    return round(Math.max(0, Math.min(100, pct)), 1);
  }

  function calculateCurrentVolume(fillPercent, capacity) {
    var pct = parseFloat(fillPercent);
    var cap = parseFloat(capacity);
    if (isNaN(pct) || isNaN(cap) || cap <= 0 || pct < 0) return null;
    var vol = (pct / 100) * cap;
    return round(Math.max(0, Math.min(cap, vol)), 1);
  }

  function calculateRemainingCapacity(capacity, currentVolume) {
    var cap = parseFloat(capacity);
    var vol = parseFloat(currentVolume);
    if (isNaN(cap) || isNaN(vol) || cap <= 0) return null;
    return round(Math.max(0, cap - vol), 1);
  }

  function calculateTdsReduction(inputTds, productTds) {
    var inT = parseFloat(inputTds);
    var prT = parseFloat(productTds);
    if (isNaN(inT) || isNaN(prT) || inT <= 0) return null;
    return round(((inT - prT) / inT) * 100, 1);
  }

  var REQUIRED_READINGS = [
    { key: 'feed', label: 'Feed volume' },
    { key: 'pur', label: 'Purified volume' },
    { key: 'rej', label: 'Reject volume' },
    { key: 'tds', label: 'Input TDS' },
    { key: 'ntu', label: 'Input turbidity' }
  ];

  function getMissingReadings(record) {
    return REQUIRED_READINGS.filter(function (req) {
      var val = record[req.key];
      return val === null || val === undefined || val === '' || isNaN(val);
    }).map(function (req) { return req.label; });
  }

  /**
   * Determine the test evaluation status based on measurements and configured baselines.
   * Possible statuses:
   * - 'Within baseline'
   * - 'Incomplete'
   * - 'Change detected'
   */
  function determineTestStatus(record, settings, historicalRuns) {
    settings = settings || {};
    var baseLo = settings.baseLo != null ? parseFloat(settings.baseLo) : 60.5;
    var baseHi = settings.baseHi != null ? parseFloat(settings.baseHi) : 63.0;

    var missing = getMissingReadings(record);
    var rec = record.recoveryRate != null
      ? record.recoveryRate
      : calculateRecovery(record.pur, record.feed);

    if (missing.length > 0) {
      var reasons = ['Missing required readings: ' + missing.join(', ') + '.'];
      if (rec != null) {
        reasons.push('Test recovery is calculated (' + rec.toFixed(1) + '%) because feed and purified volumes were recorded.');
      } else {
        reasons.push('Test recovery cannot be calculated without feed and purified volumes.');
      }
      return {
        status: 'Incomplete',
        tone: 'offline',
        reasonTitle: 'Why it is incomplete',
        reasonBg: 'var(--canvas)',
        reasons: reasons,
        triggeredMetric: missing[0],
        observedValue: 'Not recorded',
        baseline: 'Required',
        explanation: 'One or more required measurements were omitted.'
      };
    }

    // Check if recovery is outside configured baseline
    if (rec != null && (rec < baseLo || rec > baseHi)) {
      var isBelow = rec < baseLo;
      var gap = isBelow ? (baseLo - rec) : (rec - baseHi);
      var reasons = [
        'Metric: test recovery ' + rec.toFixed(1) + '%, ' + gap.toFixed(1) + ' points ' +
        (isBelow ? 'below the baseline low of ' + baseLo.toFixed(1) + '%.' : 'above the baseline high of ' + baseHi.toFixed(1) + '%.')
      ];

      // Add context comparison if historical runs provided
      if (historicalRuns && historicalRuns.length) {
        var prevTds = historicalRuns
          .filter(function (h) { return h.id !== record.id && h.tds != null; })
          .map(function (h) { return h.tds; })
          .sort(function (a, b) { return a - b; });

        if (prevTds.length) {
          var median = prevTds[Math.floor(prevTds.length / 2)];
          reasons.push('Context: input TDS ' + (record.tds != null ? record.tds + ' ppm' : '—') +
            ' against a median of ' + median + ' ppm for earlier runs (' + (record.cond || 'routine run') + ').');
        }
      }

      reasons.push('Recovery depends on source water, pressure, temperature and flow. A flag is a prompt to check conditions, not a diagnosis of filter failure.');

      return {
        status: 'Change detected',
        tone: 'attention',
        reasonTitle: 'Why it was flagged',
        reasonBg: 'var(--warning-soft)',
        reasons: reasons,
        triggeredMetric: 'Recovery rate',
        observedValue: rec.toFixed(1) + '%',
        baseline: baseLo.toFixed(1) + '–' + baseHi.toFixed(1) + '%',
        explanation: 'Test recovery (' + rec.toFixed(1) + '%) is outside the configured ' + baseLo.toFixed(1) + '–' + baseHi.toFixed(1) + '% baseline.'
      };
    }

    // Check for large water balance discrepancy
    var balDiff = calculateBalanceDifference(record.feed, record.pur, record.rej);
    if (balDiff !== null && Math.abs(balDiff) > 0.8 && record.feed > 0 && (Math.abs(balDiff) / record.feed) > 0.2) {
      return {
        status: 'Change detected',
        tone: 'attention',
        reasonTitle: 'Water balance inconsistency',
        reasonBg: 'var(--warning-soft)',
        reasons: [
          'Water balance difference is ' + balDiff.toFixed(1) + ' L (' + Math.round((Math.abs(balDiff) / record.feed) * 100) + '% of feed).',
          'Feed volume (' + record.feed + ' L) differs significantly from Purified (' + record.pur + ' L) + Reject (' + record.rej + ' L).',
          'Check for measurement error, unmetered drainage or leaks.'
        ],
        triggeredMetric: 'Balance difference',
        observedValue: balDiff.toFixed(1) + ' L',
        baseline: '±0.5 L',
        explanation: 'Feed water does not match the sum of purified and reject water.'
      };
    }

    return {
      status: 'Within baseline',
      tone: 'normal',
      reasonTitle: 'Within baseline',
      reasonBg: 'var(--surface)',
      reasons: [
        'All required readings were recorded, and test recovery ' + rec.toFixed(1) + '% is inside the configured ' + baseLo + '–' + baseHi + '% baseline.'
      ],
      triggeredMetric: null,
      observedValue: rec.toFixed(1) + '%',
      baseline: baseLo + '–' + baseHi + '%',
      explanation: 'Test readings match all baseline criteria.'
    };
  }

  /**
   * Filter records by time period
   * period: '24h' | '7d' | '30d' | 'custom'
   */
  function filterRecordsByPeriod(records, period, customStart, customEnd, referenceNow) {
    if (!Array.isArray(records) || records.length === 0) return [];
    var maxRecordTs = records.reduce(function (max, r) { return Math.max(max, r.timestamp || 0); }, 0);
    var refTs = referenceNow ? new Date(referenceNow).getTime() : Date.now();
    var now = Math.max(refTs, maxRecordTs);

    var cutoff;
    if (period === '24h') {
      cutoff = now - 24 * 60 * 60 * 1000;
      return records.filter(function (r) { return r.timestamp >= cutoff; });
    } else if (period === '7d') {
      cutoff = now - 7 * 24 * 60 * 60 * 1000;
      return records.filter(function (r) { return r.timestamp >= cutoff; });
    } else if (period === '30d') {
      cutoff = now - 30 * 24 * 60 * 60 * 1000;
      return records.filter(function (r) { return r.timestamp >= cutoff; });
    } else if (period === 'custom') {
      var startTs = customStart ? new Date(customStart).getTime() : 0;
      var endTs = customEnd ? new Date(customEnd).getTime() + (24 * 60 * 60 * 1000 - 1) : now + 86400000;
      return records.filter(function (r) { return r.timestamp >= startTs && r.timestamp <= endTs; });
    }
    return records.slice();
  }

  /**
   * Aggregate records into daily or hourly time buckets for charts and ledgers.
   */
  function aggregateRecords(records, period, settings, customStart, customEnd, referenceNow) {
    records = records || [];
    settings = settings || {};
    var baseLo = settings.baseLo != null ? parseFloat(settings.baseLo) : 60.5;
    var baseHi = settings.baseHi != null ? parseFloat(settings.baseHi) : 63.0;

    var filtered = filterRecordsByPeriod(records, period, customStart, customEnd, referenceNow);

    // Sum overall volumes
    var totFeed = 0, totPur = 0, totRej = 0, totRejCollected = 0, totReused = 0;
    var allReuses = [];

    filtered.forEach(function (r) {
      if (r.feed != null && !isNaN(r.feed)) totFeed += r.feed;
      if (r.pur != null && !isNaN(r.pur)) totPur += r.pur;
      if (r.rej != null && !isNaN(r.rej)) totRej += r.rej;
      if (r.rejCollected != null && !isNaN(r.rejCollected)) totRejCollected += r.rejCollected;
      else if (r.rej != null && !isNaN(r.rej)) totRejCollected += r.rej; // default collected = generated if not specified

      if (Array.isArray(r.reuses)) {
        r.reuses.forEach(function (re) {
          allReuses.push(re);
          totReused += (re.vol || 0);
        });
      } else if (r.rejReused != null && !isNaN(r.rejReused)) {
        totReused += r.rejReused;
      }
    });

    totFeed = round(totFeed, 1);
    totPur = round(totPur, 1);
    totRej = round(totRej, 1);
    totRejCollected = round(totRejCollected, 1);
    totReused = round(totReused, 1);

    var aggRec = totFeed > 0 ? round((totPur / totFeed) * 100, 1) : null;
    var aggFrac = totFeed > 0 ? round((totRej / totFeed) * 100, 1) : null;
    var balDiff = calculateBalanceDifference(totFeed, totPur, totRej);

    // Build timeline rows for charts
    var rows = [];
    if (period === '24h') {
      // 12 2-hour buckets
      var bucketMap = {};
      var labels = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
      labels.forEach(function (l) {
        bucketMap[l] = { label: l, full: l + ' window', feed: 0, pur: 0, rej: 0, tds: [], ntu: [], ptds: [] };
      });

      filtered.forEach(function (r) {
        var d = new Date(r.timestamp);
        var h = d.getHours();
        var bucketH = Math.floor(h / 2) * 2;
        var key = String(bucketH).padStart(2, '0') + ':00';
        if (bucketMap[key]) {
          bucketMap[key].feed += (r.feed || 0);
          bucketMap[key].pur += (r.pur || 0);
          bucketMap[key].rej += (r.rej || 0);
          if (r.tds != null) bucketMap[key].tds.push(r.tds);
          if (r.ntu != null) bucketMap[key].ntu.push(r.ntu);
          if (r.ptds != null) bucketMap[key].ptds.push(r.ptds);
        }
      });

      labels.forEach(function (l) {
        var b = bucketMap[l];
        var avgTds = b.tds.length ? Math.round(b.tds.reduce(function (x, y) { return x + y; }, 0) / b.tds.length) : null;
        var avgNtu = b.ntu.length ? round(b.ntu.reduce(function (x, y) { return x + y; }, 0) / b.ntu.length, 1) : null;
        var avgPtds = b.ptds.length ? Math.round(b.ptds.reduce(function (x, y) { return x + y; }, 0) / b.ptds.length) : null;
        rows.push({
          label: b.label,
          full: b.full,
          feed: round(b.feed, 2),
          pur: round(b.pur, 2),
          rej: round(b.rej, 2),
          tds: avgTds,
          ntu: avgNtu,
          ptds: avgPtds
        });
      });
    } else {
      // Group by calendar day
      var dayMap = {};
      filtered.forEach(function (r) {
        var d = new Date(r.timestamp);
        var dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var label = d.getDate() + ' ' + months[d.getMonth()];
        var full = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

        if (!dayMap[dateKey]) {
          dayMap[dateKey] = { label: label, full: full, timestamp: r.timestamp, feed: 0, pur: 0, rej: 0, tds: [], ntu: [], ptds: [] };
        }
        dayMap[dateKey].feed += (r.feed || 0);
        dayMap[dateKey].pur += (r.pur || 0);
        dayMap[dateKey].rej += (r.rej || 0);
        if (r.tds != null) dayMap[dateKey].tds.push(r.tds);
        if (r.ntu != null) dayMap[dateKey].ntu.push(r.ntu);
        if (r.ptds != null) dayMap[dateKey].ptds.push(r.ptds);
      });

      var sortedKeys = Object.keys(dayMap).sort();
      sortedKeys.forEach(function (k) {
        var b = dayMap[k];
        var avgTds = b.tds.length ? Math.round(b.tds.reduce(function (x, y) { return x + y; }, 0) / b.tds.length) : null;
        var avgNtu = b.ntu.length ? round(b.ntu.reduce(function (x, y) { return x + y; }, 0) / b.ntu.length, 1) : null;
        var avgPtds = b.ptds.length ? Math.round(b.ptds.reduce(function (x, y) { return x + y; }, 0) / b.ptds.length) : null;
        rows.push({
          label: b.label,
          full: b.full,
          timestamp: b.timestamp,
          feed: round(b.feed, 1),
          pur: round(b.pur, 1),
          rej: round(b.rej, 1),
          tds: avgTds,
          ntu: avgNtu,
          ptds: avgPtds
        });
      });
    }

    // Identify days below baseline
    var belowDays = rows.filter(function (r) {
      return r.feed > 0 && r.pur > 0 && baseLo != null && (r.pur / r.feed * 100) < baseLo;
    });

    return {
      filteredRecords: filtered,
      tot: {
        feed: totFeed,
        pur: totPur,
        rej: totRej,
        rec: aggRec,
        frac: aggFrac,
        diff: balDiff != null ? balDiff.toFixed(1) : '0.0',
        collected: totRejCollected,
        reused: totReused
      },
      rows: rows,
      allReuses: allReuses,
      belowDays: belowDays
    };
  }

  return {
    round: round,
    calculateRecovery: calculateRecovery,
    calculateRejectFraction: calculateRejectFraction,
    calculateBalanceDifference: calculateBalanceDifference,
    calculateTankFill: calculateTankFill,
    calculateCurrentVolume: calculateCurrentVolume,
    calculateRemainingCapacity: calculateRemainingCapacity,
    calculateTdsReduction: calculateTdsReduction,
    getMissingReadings: getMissingReadings,
    determineTestStatus: determineTestStatus,
    filterRecordsByPeriod: filterRecordsByPeriod,
    aggregateRecords: aggregateRecords
  };
});
