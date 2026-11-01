/**
 * RejectWise - Persistence and API Service Layer
 * Manages localStorage persistence with in-memory fallback, initial demo data seed,
 * and a standard service interface designed for future backend/ESP32 integration.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.storage = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STORAGE_KEYS = {
    DEVICES: 'rejectwise_devices',
    RECORDS: 'rejectwise_records',
    ALERTS: 'rejectwise_alerts',
    SETTINGS: 'rejectwise_settings',
    ACTIVE_DEVICE: 'rejectwise_active_device',
    INITIALIZED: 'rejectwise_initialized_v1'
  };

  // In-memory fallback if localStorage is disabled or unavailable
  var memStore = {};

  function isLocalStorageAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      var testKey = '__rw_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  var hasLocal = isLocalStorageAvailable();

  function getItem(key) {
    if (hasLocal) {
      try {
        var val = window.localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        return memStore[key] || null;
      }
    }
    return memStore[key] || null;
  }

  function setItem(key, value) {
    if (hasLocal) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // Storage limit or permission error
      }
    }
    memStore[key] = value;
  }

  function removeItem(key) {
    if (hasLocal) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {}
    }
    delete memStore[key];
  }

  // Generate seed demo data matching the prototype's verified dataset
  function generateSeedData() {
    var feed = [4.1,3.9,4.4,4.2,4.6,3.7,4.0,4.3,4.5,3.8,4.2,4.4,4.1,3.9,4.6,4.3,4.0,4.2,3.8,4.5,4.4,4.1,4.3,4.2,4.6,3.8,4.4,4.0,4.5,4.5];
    var pur = [2.5,2.4,2.7,2.6,2.8,2.3,2.5,2.7,2.8,2.3,2.6,2.6,2.5,2.4,2.8,2.7,2.5,2.6,2.3,2.8,2.7,2.5,2.7,2.6,2.8,2.3,2.7,2.4,2.8,2.8];
    var tds = [471,476,480,474,482,478,469,485,488,479,483,505,498,486,477,481,484,490,473,476,482,487,480,483,495,488,491,502,479,486];
    var ntu = [1.8,1.9,2.0,1.7,2.2,2.1,1.9,2.0,2.3,1.8,2.0,2.6,2.4,2.1,1.9,2.0,2.2,1.8,1.9,2.1,2.0,2.2,1.9,2.0,2.2,1.9,2.0,2.4,2.0,2.1];
    var ptds = [33,34,35,33,36,34,32,35,36,34,35,38,37,35,34,34,35,36,33,34,35,36,34,34,36,35,35,37,33,34];

    var devices = [
      { id: 'unit-01', name: 'RejectWise Unit 01', location: 'Test bench A', status: 'active', controller: 'Manual Entry' },
      { id: 'unit-02', name: 'RejectWise Unit 02', location: '', status: 'idle', controller: 'ESP32 (Not connected)' }
    ];

    var settings = {
      'unit-01': {
        name: 'RejectWise Unit 01', location: 'Test bench A', capacity: '20', threshold: '90', freshness: '30', baseLo: '60.5', baseHi: '63.0',
        sensors: { inTds: 'installed', inNtu: 'installed', prodTds: 'installed', feedFlow: 'installed', rejFlow: 'installed', purFlow: 'none', level: 'installed', pressure: 'none' }
      },
      'unit-02': {
        name: 'RejectWise Unit 02', location: '', capacity: '20', threshold: '90', freshness: '30', baseLo: '60.5', baseHi: '63.0',
        sensors: { inTds: 'none', inNtu: 'none', prodTds: 'none', feedFlow: 'none', rejFlow: 'none', purFlow: 'none', level: 'none', pressure: 'none' }
      }
    };

    var rawRuns = [
      { id: 'T-014', day: 29, time: '10:20 AM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.5, pur: 2.8, rej: 1.7, tds: 486, ntu: 2.1, ptds: 34, feedFlow: 0.62, rejFlow: 0.24, purFlow: null },
      { id: 'T-013', day: 28, time: '5:05 PM', cond: 'Municipal supply', notes: 'Turbidity reading went stale during the run, so no turbidity value was recorded.', feed: 4.5, pur: 2.8, rej: 1.7, tds: 479, ntu: null, ptds: 33, feedFlow: 0.61, rejFlow: 0.24, purFlow: null },
      { id: 'T-012', day: 27, time: '9:40 AM', cond: 'Borewell blend', notes: 'Higher input TDS on a borewell blend. Recovery was below baseline; compare flow and pressure context before drawing conclusions.', feed: 4.0, pur: 2.4, rej: 1.6, tds: 502, ntu: 2.4, ptds: 37, feedFlow: 0.58, rejFlow: 0.25, purFlow: null },
      { id: 'T-011', day: 26, time: '3:12 PM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.4, pur: 2.7, rej: 1.7, tds: 491, ntu: 2.0, ptds: 35, feedFlow: 0.62, rejFlow: 0.23, purFlow: null },
      { id: 'T-010', day: 25, time: '11:30 AM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 3.8, pur: 2.3, rej: 1.5, tds: 488, ntu: 1.9, ptds: 35, feedFlow: 0.60, rejFlow: 0.23, purFlow: null },
      { id: 'T-009', day: 24, time: '10:05 AM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.6, pur: 2.8, rej: 1.8, tds: 495, ntu: 2.2, ptds: 36, feedFlow: 0.63, rejFlow: 0.24, purFlow: null },
      { id: 'T-008', day: 23, time: '4:40 PM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.2, pur: 2.6, rej: 1.6, tds: 483, ntu: 2.0, ptds: 34, feedFlow: 0.60, rejFlow: 0.23, purFlow: null },
      { id: 'T-007', day: 20, time: '9:25 AM', cond: 'Municipal supply', notes: 'First run after the ESP32 reconnected.', feed: 4.4, pur: 2.7, rej: 1.7, tds: 482, ntu: 2.0, ptds: 35, feedFlow: 0.61, rejFlow: 0.23, purFlow: null },
      { id: 'T-006', day: 17, time: '2:10 PM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.2, pur: 2.6, rej: 1.6, tds: 490, ntu: 1.8, ptds: 36, feedFlow: 0.60, rejFlow: 0.23, purFlow: null },
      { id: 'T-005', day: 14, time: '10:45 AM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.6, pur: 2.8, rej: 1.8, tds: 477, ntu: 1.9, ptds: 34, feedFlow: 0.63, rejFlow: 0.24, purFlow: null },
      { id: 'T-004', day: 11, time: '9:10 AM', cond: 'Borewell blend', notes: 'Borewell blend. Recovery below baseline; the tank reached capacity the same evening.', feed: 4.4, pur: 2.6, rej: 1.8, tds: 505, ntu: 2.6, ptds: 38, feedFlow: 0.59, rejFlow: 0.25, purFlow: null },
      { id: 'T-003', day: 8, time: '11:00 AM', cond: 'Municipal supply', notes: 'Routine daily run.', feed: 4.5, pur: 2.8, rej: 1.7, tds: 488, ntu: 2.3, ptds: 36, feedFlow: 0.62, rejFlow: 0.24, purFlow: null }
    ];

    // Reference base year/month: Oct 2026
    var baseYear = 2026, baseMonth = 9; // October (0-indexed)

    var reuseSeed = [
      { id: 'R-3', day: 28, time: '6:40 PM', vol: 7.2, use: 'Floor cleaning', testId: 'T-013' },
      { id: 'R-2', day: 21, time: '8:15 AM', vol: 6.0, use: 'Garden watering', testId: 'T-007' },
      { id: 'R-1', day: 13, time: '7:50 AM', vol: 5.5, use: 'Toilet flushing', testId: 'T-004' }
    ];

    // Create 30 daily test records + additional runs
    var records = [];

    // First, generate routine daily baseline records for all 30 days
    for (var i = 0; i < 30; i++) {
      var dNum = i + 1;
      var dObj = new Date(baseYear, baseMonth, dNum, 10, 0, 0);
      var recVal = Math.round((pur[i] / feed[i]) * 1000) / 10;
      var st = (recVal < 60.5 || recVal > 63.0) ? 'Change detected' : 'Within baseline';

      // Find matching reuse if any
      var rEntries = [];
      reuseSeed.forEach(function (rs) {
        if (rs.day === dNum) {
          rEntries.push({
            id: rs.id,
            vol: rs.vol,
            use: rs.use,
            date: dNum + ' Oct 2026, ' + rs.time,
            timestamp: new Date(baseYear, baseMonth, dNum, 18, 30, 0).getTime(),
            notes: 'Logged non-potable reuse'
          });
        }
      });

      var totalReused = rEntries.reduce(function (sum, r) { return sum + r.vol; }, 0);
      var rejGen = Math.round((feed[i] - pur[i]) * 10) / 10;

      records.push({
        id: 'T-' + String(100 + dNum),
        deviceId: 'unit-01',
        source: 'demo',
        date: dNum + ' Oct 2026, 10:00 AM',
        dateOnly: dNum + ' Oct 2026',
        timeOnly: '10:00 AM',
        timestamp: dObj.getTime(),
        cond: (dNum === 11 || dNum === 27) ? 'Borewell blend' : 'Municipal supply',
        notes: (dNum === 28) ? 'Turbidity reading went stale during run.' : 'Daily scheduled test run.',
        feed: feed[i],
        pur: pur[i],
        rej: rejGen,
        rejCollected: (dNum === 12) ? Math.round((rejGen - 1.2) * 10) / 10 : rejGen,
        rejReused: totalReused,
        reuses: rEntries,
        tds: tds[i],
        ntu: (dNum === 28) ? null : ntu[i],
        ptds: ptds[i],
        feedFlow: 0.62,
        rejFlow: 0.24,
        purFlow: null,
        tankVolume: (dNum === 30) ? 14.4 : (dNum === 28 ? 18.2 : (dNum === 12 ? 20.0 : 11.0)),
        tankPct: (dNum === 30) ? 72 : (dNum === 28 ? 91 : (dNum === 12 ? 100 : 55)),
        tankCapacity: 20,
        recoveryRate: recVal,
        rejectFraction: Math.round((rejGen / feed[i]) * 1000) / 10,
        balanceDiff: 0,
        tdsReduction: Math.round(((tds[i] - ptds[i]) / tds[i]) * 1000) / 10,
        status: (dNum === 28) ? 'Incomplete' : st
      });
    }

    // Now overwrite specific detailed test runs T-014 through T-003 to match exact IDs
    rawRuns.forEach(function (rr) {
      var dObj = new Date(baseYear, baseMonth, rr.day, 10, 20, 0);
      var recVal = Math.round((rr.pur / rr.feed) * 1000) / 10;
      var st = rr.ntu == null ? 'Incomplete' : (recVal < 60.5 || recVal > 63.0) ? 'Change detected' : 'Within baseline';

      var rEntries = [];
      reuseSeed.forEach(function (rs) {
        if (rs.day === rr.day) {
          rEntries.push({
            id: rs.id,
            vol: rs.vol,
            use: rs.use,
            date: rr.day + ' Oct 2026, ' + rs.time,
            timestamp: new Date(baseYear, baseMonth, rr.day, 18, 40, 0).getTime(),
            notes: 'Recorded reuse'
          });
        }
      });

      // Update or insert
      var existingIdx = -1;
      for (var k = 0; k < records.length; k++) {
        if (records[k].id === rr.id || records[k].id === 'T-' + String(100 + rr.day)) {
          existingIdx = k;
          break;
        }
      }

      var item = {
        id: rr.id,
        deviceId: 'unit-01',
        source: 'demo',
        date: rr.day + ' Oct 2026, ' + rr.time,
        dateOnly: rr.day + ' Oct 2026',
        timeOnly: rr.time,
        timestamp: dObj.getTime(),
        cond: rr.cond,
        notes: rr.notes,
        feed: rr.feed,
        pur: rr.pur,
        rej: rr.rej,
        rejCollected: (rr.day === 12) ? Math.round((rr.rej - 1.2) * 10) / 10 : rr.rej,
        rejReused: rEntries.reduce(function (sum, r) { return sum + r.vol; }, 0),
        reuses: rEntries,
        tds: rr.tds,
        ntu: rr.ntu,
        ptds: rr.ptds,
        feedFlow: rr.feedFlow,
        rejFlow: rr.rejFlow,
        purFlow: rr.purFlow,
        tankVolume: (rr.day === 28) ? 18.2 : 14.4,
        tankPct: (rr.day === 28) ? 91 : 72,
        tankCapacity: 20,
        recoveryRate: recVal,
        rejectFraction: Math.round((rr.rej / rr.feed) * 1000) / 10,
        balanceDiff: 0,
        tdsReduction: Math.round(((rr.tds - rr.ptds) / rr.tds) * 1000) / 10,
        status: st
      };

      if (existingIdx >= 0) {
        records[existingIdx] = item;
      } else {
        records.push(item);
      }
    });

    // Sort descending by timestamp
    records.sort(function (a, b) { return b.timestamp - a.timestamp; });

    // Initial alerts
    var ev = function (t, text) { return { t: t, text: text }; };
    var alerts = [
      {
        id: 'A-106', deviceId: 'unit-01', kind: 'stale', severity: 'warning', title: 'Input turbidity reading stale',
        raised: '29 Oct 2026, 5:05 PM', timestamp: new Date(2026, 9, 29, 17, 5).getTime(), day: 29,
        subsystem: 'Input turbidity sensor', observed: 'No reading 4:35 to 5:22 PM (47 min)', thrKey: 'freshness',
        threshold: 'Freshness window 30 min (configured)',
        next: 'Check the sensor cable and that the probe is submerged.',
        detail: 'The turbidity sensor stopped reporting at 4:35 PM, so test run T-013 was saved without a turbidity value. A valid reading arrived at 5:22 PM and the alert resolved itself; readings have been fresh since, up to the 10:42 AM sample on 30 Oct.',
        related: 'T-013', status: 'resolved',
        events: [ev('29 Oct, 5:05 PM', 'Raised: no reading within the configured freshness window.'), ev('29 Oct, 5:22 PM', 'Auto-resolved: a valid reading arrived (2.0 NTU).')]
      },
      {
        id: 'A-105', deviceId: 'unit-01', kind: 'tank', severity: 'warning', title: 'Tank above alert level',
        raised: '28 Oct 2026, 6:10 PM', timestamp: new Date(2026, 9, 28, 18, 10).getTime(), day: 28,
        subsystem: 'Collection tank', observed: '91% (18.2 L of 20 L)', thrKey: 'tank',
        threshold: '90% alert level (configured)',
        next: 'Reuse collected reject water for a non-potable purpose, or empty the tank.',
        detail: 'The measured level reached the configured alert level. 7.2 L was then reused for floor cleaning, which brought the level back below it.',
        status: 'resolved',
        events: [ev('28 Oct, 6:10 PM', 'Raised: level 91% reached the configured alert level.'), ev('28 Oct, 6:20 PM', 'Acknowledged.'), ev('28 Oct, 6:40 PM', 'Auto-resolved: level fell to 55% after 7.2 L was reused.')]
      },
      {
        id: 'A-104', deviceId: 'unit-01', kind: 'test', severity: 'info', title: 'Test recovery below baseline',
        raised: '28 Oct 2026, 9:40 AM', timestamp: new Date(2026, 9, 28, 9, 40).getTime(), day: 28,
        subsystem: 'Recovery rate, test T-012', observed: '60.0% test recovery', thrKey: 'baseline',
        threshold: 'Baseline 60.5–63.0% (configured)',
        next: 'Compare input TDS and feed flow for run T-012, then resolve with your finding.',
        detail: 'Test T-012 recovered 60.0%, below the configured baseline, while input TDS was higher than usual (502 ppm, borewell blend). Later runs are back inside the baseline, but a test flag stays open until a person reviews it. It is a prompt to investigate, not a diagnosis of filter condition.',
        related: 'T-012', status: 'acknowledged',
        events: [ev('28 Oct, 9:40 AM', 'Raised: test recovery 60.0% is below the baseline low.'), ev('28 Oct, 10:05 AM', 'Acknowledged. Awaiting review.')]
      },
      {
        id: 'A-103', deviceId: 'unit-01', kind: 'connection', severity: 'critical', title: 'ESP32 disconnected',
        raised: '20 Oct 2026, 2:15 PM', timestamp: new Date(2026, 9, 20, 14, 15).getTime(), day: 20,
        subsystem: 'Device connection', observed: 'No readings 1:45 to 2:23 PM (38 min)', thrKey: 'freshness',
        threshold: 'Freshness window 30 min (configured)',
        next: 'Check power and Wi-Fi at the unit.',
        detail: 'The device sent no readings for 38 minutes. No values exist for that window, and none were estimated to fill it.',
        status: 'resolved',
        events: [ev('20 Oct, 2:15 PM', 'Raised: no readings within the configured freshness window.'), ev('20 Oct, 2:23 PM', 'Auto-resolved: readings resumed.')]
      },
      {
        id: 'A-102', deviceId: 'unit-01', kind: 'tankfull', severity: 'critical', title: 'Tank full',
        raised: '12 Oct 2026, 7:30 PM', timestamp: new Date(2026, 9, 12, 19, 30).getTime(), day: 12,
        subsystem: 'Collection tank', observed: '100% (20 L of 20 L)', thrKey: null,
        threshold: '100% capacity',
        next: 'Reuse or empty collected water.',
        detail: 'The tank filled before it was emptied. About 1.2 L of reject water was generated but not collected while it was full.',
        status: 'resolved',
        events: [ev('12 Oct, 7:30 PM', 'Raised: tank at 100%.'), ev('12 Oct, 8:05 PM', 'Acknowledged.'), ev('13 Oct, 7:50 AM', 'Auto-resolved: level fell to 73% after 5.5 L was reused.')]
      },
      {
        id: 'A-101', deviceId: 'unit-01', kind: 'test', severity: 'info', title: 'Test recovery below baseline',
        raised: '12 Oct 2026, 9:10 AM', timestamp: new Date(2026, 9, 12, 9, 10).getTime(), day: 12,
        subsystem: 'Recovery rate, test T-004', observed: '59.1% test recovery', thrKey: 'baseline',
        threshold: 'Baseline 60.5–63.0% (configured)',
        next: 'Compare input TDS and feed flow for run T-004.',
        detail: 'Test T-004 recovered 59.1% on a borewell blend with input TDS of 505 ppm. Reviewed and resolved; a prompt to investigate, not a diagnosis.',
        related: 'T-004', status: 'resolved',
        events: [ev('12 Oct, 9:10 AM', 'Raised: test recovery 59.1% is below the baseline low.'), ev('12 Oct, 9:30 AM', 'Acknowledged.'), ev('13 Oct, 10:00 AM', 'Resolved by reviewer: higher input TDS from the borewell blend.')]
      }
    ];

    return {
      devices: devices,
      records: records,
      alerts: alerts,
      settings: settings,
      activeDevice: 'unit-01'
    };
  }

  // Ensure initial data is stored
  function initStorage() {
    var isInitialized = getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      resetToDemo();
    }
  }

  function resetToDemo() {
    var seed = generateSeedData();
    setItem(STORAGE_KEYS.DEVICES, seed.devices);
    setItem(STORAGE_KEYS.RECORDS, seed.records);
    setItem(STORAGE_KEYS.ALERTS, seed.alerts);
    setItem(STORAGE_KEYS.SETTINGS, seed.settings);
    setItem(STORAGE_KEYS.ACTIVE_DEVICE, seed.activeDevice);
    setItem(STORAGE_KEYS.INITIALIZED, true);
    return seed;
  }

  function clearAllData() {
    setItem(STORAGE_KEYS.DEVICES, [
      { id: 'unit-01', name: 'RejectWise Unit 01', location: 'Lab A', status: 'active', controller: 'Manual Entry' }
    ]);
    setItem(STORAGE_KEYS.RECORDS, []);
    setItem(STORAGE_KEYS.ALERTS, []);
    setItem(STORAGE_KEYS.ACTIVE_DEVICE, 'unit-01');
  }

  // API Methods
  function getDevices() {
    initStorage();
    return getItem(STORAGE_KEYS.DEVICES) || [];
  }

  function saveDevice(device) {
    initStorage();
    var devices = getDevices();
    var idx = -1;
    for (var i = 0; i < devices.length; i++) {
      if (devices[i].id === device.id) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      devices[idx] = Object.assign({}, devices[idx], device);
    } else {
      devices.push(device);
    }
    setItem(STORAGE_KEYS.DEVICES, devices);

    // Also ensure settings exist for device
    var allSettings = getItem(STORAGE_KEYS.SETTINGS) || {};
    if (!allSettings[device.id]) {
      allSettings[device.id] = {
        name: device.name,
        location: device.location || '',
        capacity: '20',
        threshold: '90',
        freshness: '30',
        baseLo: '60.5',
        baseHi: '63.0',
        sensors: { inTds: 'installed', inNtu: 'installed', prodTds: 'installed', feedFlow: 'installed', rejFlow: 'installed', purFlow: 'none', level: 'installed', pressure: 'none' }
      };
      setItem(STORAGE_KEYS.SETTINGS, allSettings);
    }

    return device;
  }

  function deleteDevice(deviceId) {
    initStorage();
    var devices = getDevices().filter(function (d) { return d.id !== deviceId; });
    setItem(STORAGE_KEYS.DEVICES, devices);
    // Also remove records
    var records = (getItem(STORAGE_KEYS.RECORDS) || []).filter(function (r) { return r.deviceId !== deviceId; });
    setItem(STORAGE_KEYS.RECORDS, records);
    // Also remove alerts
    var alerts = (getItem(STORAGE_KEYS.ALERTS) || []).filter(function (a) { return a.deviceId !== deviceId; });
    setItem(STORAGE_KEYS.ALERTS, alerts);
  }

  function getActiveDeviceId() {
    initStorage();
    return getItem(STORAGE_KEYS.ACTIVE_DEVICE) || 'unit-01';
  }

  function setActiveDeviceId(id) {
    setItem(STORAGE_KEYS.ACTIVE_DEVICE, id);
  }

  function getSettings(deviceId) {
    initStorage();
    var all = getItem(STORAGE_KEYS.SETTINGS) || {};
    return all[deviceId] || {
      name: 'RejectWise Unit',
      location: '',
      capacity: '20',
      threshold: '90',
      freshness: '30',
      baseLo: '60.5',
      baseHi: '63.0',
      sensors: { inTds: 'installed', inNtu: 'installed', prodTds: 'installed', feedFlow: 'installed', rejFlow: 'installed', purFlow: 'none', level: 'installed', pressure: 'none' }
    };
  }

  function getAllSettings() {
    initStorage();
    return getItem(STORAGE_KEYS.SETTINGS) || {};
  }

  function saveSettings(deviceId, settings) {
    initStorage();
    var all = getItem(STORAGE_KEYS.SETTINGS) || {};
    all[deviceId] = Object.assign({}, all[deviceId] || {}, settings);
    setItem(STORAGE_KEYS.SETTINGS, all);

    // Also update device name if changed
    var devices = getDevices();
    var updated = false;
    devices.forEach(function (d) {
      if (d.id === deviceId && settings.name) {
        d.name = settings.name;
        if (settings.location !== undefined) d.location = settings.location;
        updated = true;
      }
    });
    if (updated) setItem(STORAGE_KEYS.DEVICES, devices);
    return all[deviceId];
  }

  function getRecords(deviceId) {
    initStorage();
    var records = getItem(STORAGE_KEYS.RECORDS) || [];
    if (deviceId && deviceId !== 'all') {
      return records.filter(function (r) { return r.deviceId === deviceId; });
    }
    return records;
  }

  function getRecordById(id) {
    initStorage();
    var records = getItem(STORAGE_KEYS.RECORDS) || [];
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) return records[i];
    }
    return null;
  }

  function createRecord(record) {
    initStorage();
    var records = getItem(STORAGE_KEYS.RECORDS) || [];
    records.unshift(record);
    setItem(STORAGE_KEYS.RECORDS, records);
    return record;
  }

  function updateRecord(id, updatedFields) {
    initStorage();
    var records = getItem(STORAGE_KEYS.RECORDS) || [];
    var found = null;
    for (var i = 0; i < records.length; i++) {
      if (records[i].id === id) {
        records[i] = Object.assign({}, records[i], updatedFields);
        found = records[i];
        break;
      }
    }
    if (found) {
      setItem(STORAGE_KEYS.RECORDS, records);
    }
    return found;
  }

  function deleteRecord(id) {
    initStorage();
    var records = getItem(STORAGE_KEYS.RECORDS) || [];
    var filtered = records.filter(function (r) { return r.id !== id; });
    setItem(STORAGE_KEYS.RECORDS, filtered);
    return filtered.length < records.length;
  }

  function getAlerts(deviceId) {
    initStorage();
    var alerts = getItem(STORAGE_KEYS.ALERTS) || [];
    if (deviceId && deviceId !== 'all') {
      return alerts.filter(function (a) { return a.deviceId === deviceId; });
    }
    return alerts;
  }

  function saveAlerts(alerts) {
    setItem(STORAGE_KEYS.ALERTS, alerts);
  }

  function updateAlertStatus(id, newStatus, eventText) {
    initStorage();
    var alerts = getItem(STORAGE_KEYS.ALERTS) || [];
    var now = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var hh = now.getHours();
    var mm = String(now.getMinutes()).padStart(2, '0');
    var timeStr = now.getDate() + ' ' + months[now.getMonth()] + ', ' + (hh % 12 || 12) + ':' + mm + (hh < 12 ? ' AM' : ' PM');

    var found = null;
    alerts = alerts.map(function (a) {
      if (a.id !== id) return a;
      var events = (a.events || []).concat([{ t: timeStr, text: eventText || ('Status updated to ' + newStatus) }]);
      found = Object.assign({}, a, { status: newStatus, events: events });
      return found;
    });

    if (found) {
      setItem(STORAGE_KEYS.ALERTS, alerts);
    }
    return found;
  }

  // Initialize immediately
  initStorage();

  return {
    isLocalStorageAvailable: isLocalStorageAvailable,
    resetToDemo: resetToDemo,
    clearAllData: clearAllData,
    getDevices: getDevices,
    saveDevice: saveDevice,
    deleteDevice: deleteDevice,
    getActiveDeviceId: getActiveDeviceId,
    setActiveDeviceId: setActiveDeviceId,
    getSettings: getSettings,
    getAllSettings: getAllSettings,
    saveSettings: saveSettings,
    getRecords: getRecords,
    getRecordById: getRecordById,
    createRecord: createRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    getAlerts: getAlerts,
    saveAlerts: saveAlerts,
    updateAlertStatus: updateAlertStatus
  };
});
