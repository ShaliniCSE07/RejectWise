/**
 * RejectWise - Alert Generation and Lifecycle Management Engine
 * Evaluates operational conditions, tank levels, and test runs against configured baselines.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.alerts = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function nowLabel() {
    var t = new Date(), m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][t.getMonth()];
    var hh = t.getHours();
    var mm = String(t.getMinutes()).padStart(2, '0');
    return t.getDate() + ' ' + m + ', ' + (hh % 12 || 12) + ':' + mm + (hh < 12 ? ' AM' : ' PM');
  }

  function getNextAlertId(existingAlerts) {
    var maxNum = 100;
    (existingAlerts || []).forEach(function (a) {
      if (a && a.id && a.id.indexOf('A-') === 0) {
        var num = parseInt(a.id.slice(2), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return 'A-' + (maxNum + 1);
  }

  /**
   * Evaluate conditions across a device's records and settings, producing updated alerts list.
   */
  function evaluateAlerts(existingAlerts, deviceId, settings, currentTankState, latestRecord) {
    var list = (existingAlerts || []).map(function (a) {
      return Object.assign({}, a, { events: Array.isArray(a.events) ? a.events.slice() : [] });
    });

    settings = settings || {};
    var cap = parseFloat(settings.capacity) || 20;
    var thr = parseFloat(settings.threshold) || 90;
    var baseLo = parseFloat(settings.baseLo) || 60.5;
    var baseHi = parseFloat(settings.baseHi) || 63.0;
    var now = nowLabel();

    // 1. Evaluate Tank Level Alert
    var tankPct = currentTankState ? currentTankState.pct : null;
    var tankLevelCondition = tankPct != null && !isNaN(thr) && tankPct >= thr;
    var activeTankAlert = list.filter(function (a) {
      return a.deviceId === deviceId && a.kind === 'tank' && a.status !== 'resolved';
    })[0];

    if (tankLevelCondition && !activeTankAlert) {
      var prev = list.filter(function (a) { return a.deviceId === deviceId && a.kind === 'tank'; })[0];
      var litres = (cap > 0 ? ' (' + (Math.round(cap * tankPct / 10) / 10).toFixed(1) + ' L of ' + cap + ' L)' : '');
      list.unshift({
        id: getNextAlertId(list),
        deviceId: deviceId,
        kind: 'tank',
        severity: tankPct >= 98 ? 'critical' : 'warning',
        title: tankPct >= 98 ? 'Tank full' : 'Tank above alert level',
        raised: now,
        timestamp: Date.now(),
        day: new Date().getDate(),
        subsystem: 'Collection tank',
        observed: tankPct + '%' + litres,
        thrKey: 'tank',
        threshold: thr + '% alert level (configured)',
        next: 'Reuse collected reject water for a non-potable purpose, empty the tank, or review the alert level.',
        detail: 'The measured collection tank level (' + tankPct + '%) reached or exceeded the configured alert level (' + thr + '%). This condition clears automatically when the tank level falls below the threshold.',
        recurrenceOf: prev ? prev.id : null,
        status: 'open',
        events: [{
          t: now,
          text: 'Raised: level ' + tankPct + '% is at or above the configured ' + thr + '% alert level.' + (prev ? ' Same condition as ' + prev.id + ', resolved earlier; logged as new occurrence.' : '')
        }]
      });
    } else if (!tankLevelCondition && activeTankAlert) {
      activeTankAlert.status = 'resolved';
      activeTankAlert.events.push({
        t: now,
        text: tankPct == null
          ? 'Auto-resolved: the level sensor is not configured.'
          : 'Auto-resolved: level ' + tankPct + '% fell below the configured ' + thr + '% alert level.'
      });
    }

    // 2. Evaluate Latest Test Recovery Alert
    if (latestRecord && latestRecord.status === 'Change detected' && latestRecord.recoveryRate != null) {
      var rec = latestRecord.recoveryRate;
      var isOut = rec < baseLo || rec > baseHi;
      var existingTestAlert = list.filter(function (a) {
        return a.deviceId === deviceId && a.related === latestRecord.id && a.status !== 'resolved';
      })[0];

      if (isOut && !existingTestAlert) {
        var isBelow = rec < baseLo;
        list.unshift({
          id: getNextAlertId(list),
          deviceId: deviceId,
          kind: 'test',
          severity: 'info',
          title: isBelow ? 'Test recovery below baseline' : 'Test recovery above baseline',
          raised: now,
          timestamp: Date.now(),
          day: new Date().getDate(),
          subsystem: 'Recovery rate, test ' + latestRecord.id,
          observed: rec.toFixed(1) + '% test recovery',
          thrKey: 'baseline',
          threshold: 'Baseline ' + baseLo + '–' + baseHi + '% (configured)',
          next: 'Compare input TDS and feed flow for run ' + latestRecord.id + ', then resolve with your finding.',
          detail: 'Test ' + latestRecord.id + ' recovered ' + rec.toFixed(1) + '%, ' + (isBelow ? 'below' : 'above') + ' the configured baseline (' + baseLo + '–' + baseHi + '%). A test flag requires manual review. It is a prompt to investigate, not a diagnosis of filter condition.',
          related: latestRecord.id,
          status: 'open',
          events: [{
            t: now,
            text: 'Raised: test recovery ' + rec.toFixed(1) + '% is ' + (isBelow ? 'below' : 'above') + ' the configured baseline.'
          }]
        });
      }
    }

    // 3. Evaluate Water Balance Inconsistency Alert
    if (latestRecord && latestRecord.balanceDiff != null && Math.abs(latestRecord.balanceDiff) > 0.8 && latestRecord.feed > 0 && (Math.abs(latestRecord.balanceDiff) / latestRecord.feed) > 0.2) {
      var existingBalAlert = list.filter(function (a) {
        return a.deviceId === deviceId && a.kind === 'balance' && a.related === latestRecord.id && a.status !== 'resolved';
      })[0];

      if (!existingBalAlert) {
        list.unshift({
          id: getNextAlertId(list),
          deviceId: deviceId,
          kind: 'balance',
          severity: 'warning',
          title: 'Significant water balance difference',
          raised: now,
          timestamp: Date.now(),
          day: new Date().getDate(),
          subsystem: 'Water balance calculation',
          observed: latestRecord.balanceDiff.toFixed(1) + ' L difference (' + Math.round((Math.abs(latestRecord.balanceDiff) / latestRecord.feed) * 100) + '% of feed)',
          thrKey: null,
          threshold: 'Expected ±0.5 L tolerance',
          next: 'Verify flow measurement devices, check for leaks, or verify manual entry values.',
          detail: 'In test run ' + latestRecord.id + ', feed water (' + latestRecord.feed + ' L) differed significantly from purified (' + latestRecord.pur + ' L) + reject generated (' + latestRecord.rej + ' L).',
          related: latestRecord.id,
          status: 'open',
          events: [{
            t: now,
            text: 'Raised: balance difference exceeded 15% of feed volume.'
          }]
        });
      }
    }

    return list;
  }

  function updateAlertStatus(alerts, alertId, newStatus, eventText) {
    var now = nowLabel();
    return (alerts || []).map(function (a) {
      if (a.id !== alertId) return a;
      var events = (a.events || []).concat([{ t: now, text: eventText || ('Status updated to ' + newStatus) }]);
      return Object.assign({}, a, { status: newStatus, events: events });
    });
  }

  return {
    nowLabel: nowLabel,
    getNextAlertId: getNextAlertId,
    evaluateAlerts: evaluateAlerts,
    updateAlertStatus: updateAlertStatus
  };
});
