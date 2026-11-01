/**
 * RejectWise - Data Models and Schema Definitions
 * Provides factory functions, seed demo data, and validation helpers.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.models = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function generateId(prefix) {
    var p = prefix || 'REC';
    var ts = Date.now().toString(36).toUpperCase();
    var rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return p + '-' + ts.slice(-4) + rnd.slice(-2);
  }

  function formatDisplayDate(dateObj) {
    var d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function formatDisplayTime(dateObj) {
    var d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    var hh = d.getHours();
    var mm = String(d.getMinutes()).padStart(2, '0');
    var ampm = hh < 12 ? 'AM' : 'PM';
    return (hh % 12 || 12) + ':' + mm + ' ' + ampm;
  }

  function createDevice(data) {
    data = data || {};
    return {
      id: data.id || 'unit-' + Math.floor(Math.random() * 900 + 100),
      name: data.name || 'RejectWise Unit',
      location: data.location || '',
      status: data.status || 'active',
      controller: data.controller || 'Manual Entry',
      createdAt: data.createdAt || Date.now()
    };
  }

  function createDeviceSettings(data) {
    data = data || {};
    return {
      name: data.name || 'RejectWise Unit',
      location: data.location || '',
      capacity: String(data.capacity != null ? data.capacity : '20'),
      threshold: String(data.threshold != null ? data.threshold : '90'),
      freshness: String(data.freshness != null ? data.freshness : '30'),
      baseLo: String(data.baseLo != null ? data.baseLo : '60.5'),
      baseHi: String(data.baseHi != null ? data.baseHi : '63.0'),
      unitSystem: data.unitSystem || 'metric', // L, ppm, NTU
      sensors: Object.assign({
        inTds: 'installed',
        inNtu: 'installed',
        prodTds: 'installed',
        feedFlow: 'installed',
        rejFlow: 'installed',
        purFlow: 'none',
        level: 'installed',
        pressure: 'none'
      }, data.sensors || {})
    };
  }

  function createReuseEntry(data) {
    data = data || {};
    return {
      id: data.id || generateId('R'),
      vol: parseFloat(data.vol) || 0,
      use: data.use || 'General non-potable cleaning',
      date: data.date || formatDisplayDate(new Date()) + ', ' + formatDisplayTime(new Date()),
      timestamp: data.timestamp || Date.now(),
      notes: data.notes || ''
    };
  }

  function createTestRecord(data) {
    data = data || {};
    var now = new Date();
    var ts = data.timestamp ? (typeof data.timestamp === 'number' ? data.timestamp : new Date(data.timestamp).getTime()) : now.getTime();
    var recordDate = new Date(ts);

    var reuses = Array.isArray(data.reuses)
      ? data.reuses.map(function (r) { return createReuseEntry(r); })
      : (data.rejReused ? [createReuseEntry({ vol: data.rejReused, use: data.reusePurpose || 'Cleaning', date: data.reuseDate || formatDisplayDate(recordDate) + ', ' + formatDisplayTime(recordDate) })] : []);

    var totalReused = reuses.reduce(function (sum, r) { return sum + (parseFloat(r.vol) || 0); }, 0);

    return {
      id: data.id || generateId('T'),
      deviceId: data.deviceId || 'unit-01',
      source: data.source || 'manual', // 'manual' | 'esp32' | 'demo'
      date: data.date || (formatDisplayDate(recordDate) + ', ' + formatDisplayTime(recordDate)),
      dateOnly: formatDisplayDate(recordDate),
      timeOnly: formatDisplayTime(recordDate),
      timestamp: ts,
      cond: data.cond || 'Manual test run',
      notes: data.notes || '',

      // Raw water volumes (L)
      feed: data.feed != null && data.feed !== '' ? parseFloat(data.feed) : null,
      pur: data.pur != null && data.pur !== '' ? parseFloat(data.pur) : null,
      rej: data.rej != null && data.rej !== '' ? parseFloat(data.rej) : null,
      rejCollected: data.rejCollected != null && data.rejCollected !== '' ? parseFloat(data.rejCollected) : null,
      rejReused: totalReused,
      reuses: reuses,

      // Quality measurements
      tds: data.tds != null && data.tds !== '' ? parseFloat(data.tds) : null,
      ntu: data.ntu != null && data.ntu !== '' ? parseFloat(data.ntu) : null,
      ptds: data.ptds != null && data.ptds !== '' ? parseFloat(data.ptds) : null,

      // Flow rates (L/min)
      feedFlow: data.feedFlow != null && data.feedFlow !== '' ? parseFloat(data.feedFlow) : null,
      rejFlow: data.rejFlow != null && data.rejFlow !== '' ? parseFloat(data.rejFlow) : null,
      purFlow: data.purFlow != null && data.purFlow !== '' ? parseFloat(data.purFlow) : null,

      // Tank information at time of test
      tankVolume: data.tankVolume != null && data.tankVolume !== '' ? parseFloat(data.tankVolume) : null,
      tankPct: data.tankPct != null && data.tankPct !== '' ? parseFloat(data.tankPct) : null,
      tankCapacity: data.tankCapacity != null && data.tankCapacity !== '' ? parseFloat(data.tankCapacity) : null,

      // Calculated values (populated by calculation engine)
      recoveryRate: data.recoveryRate != null ? parseFloat(data.recoveryRate) : null,
      rejectFraction: data.rejectFraction != null ? parseFloat(data.rejectFraction) : null,
      balanceDiff: data.balanceDiff != null ? parseFloat(data.balanceDiff) : null,
      tdsReduction: data.tdsReduction != null ? parseFloat(data.tdsReduction) : null,

      // Test evaluation status
      status: data.status || 'Within baseline', // 'Within baseline' | 'Change detected' | 'Incomplete'
      statusDetails: data.statusDetails || null
    };
  }

  function createAlert(data) {
    data = data || {};
    var nowStr = formatDisplayDate(new Date()) + ', ' + formatDisplayTime(new Date());
    return {
      id: data.id || generateId('A'),
      deviceId: data.deviceId || 'unit-01',
      kind: data.kind || 'test', // 'tank' | 'tankfull' | 'test' | 'balance' | 'stale' | 'connection'
      severity: data.severity || 'warning', // 'info' | 'warning' | 'critical'
      title: data.title || 'Water system alert',
      raised: data.raised || nowStr,
      timestamp: data.timestamp || Date.now(),
      subsystem: data.subsystem || 'Monitoring',
      observed: data.observed || '',
      thrKey: data.thrKey || null,
      threshold: data.threshold || '',
      next: data.next || 'Check purifier readings and inspect subsystem.',
      detail: data.detail || '',
      related: data.related || null,
      status: data.status || 'open', // 'open' | 'acknowledged' | 'resolved'
      events: Array.isArray(data.events) ? data.events.slice() : [{ t: data.raised || nowStr, text: 'Alert raised.' }]
    };
  }

  return {
    generateId: generateId,
    formatDisplayDate: formatDisplayDate,
    formatDisplayTime: formatDisplayTime,
    createDevice: createDevice,
    createDeviceSettings: createDeviceSettings,
    createReuseEntry: createReuseEntry,
    createTestRecord: createTestRecord,
    createAlert: createAlert
  };
});
