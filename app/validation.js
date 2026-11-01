/**
 * RejectWise - Form Validation Engine
 * Validates test readings, tank configurations, reuse entries and device settings.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.validation = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function parseNum(val) {
    if (val === null || val === undefined || val === '') return null;
    var n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  /**
   * Validate a test record draft
   * allowIncomplete: if true, missing required fields are marked as warnings rather than blocking errors.
   */
  function validateRecord(draft, settings, currentTankInventory, allowIncomplete) {
    var errors = {};
    var warnings = {};
    settings = settings || {};

    // 1. Device and time validations
    if (!draft.deviceId || !String(draft.deviceId).trim()) {
      errors.deviceId = 'Select or enter a device.';
    }
    if (!draft.testDate || !String(draft.testDate).trim()) {
      errors.testDate = 'Select the test date.';
    }
    if (!draft.testTime || !String(draft.testTime).trim()) {
      errors.testTime = 'Select the test time.';
    }

    // 2. Numerical fields parsing
    var feed = parseNum(draft.feed);
    var pur = parseNum(draft.pur);
    var rej = parseNum(draft.rej);
    var rejCollected = parseNum(draft.rejCollected);
    var rejReused = parseNum(draft.rejReused);
    var tds = parseNum(draft.tds);
    var ntu = parseNum(draft.ntu);
    var ptds = parseNum(draft.ptds);
    var feedFlow = parseNum(draft.feedFlow);
    var rejFlow = parseNum(draft.rejFlow);
    var purFlow = parseNum(draft.purFlow);
    var tankVolume = parseNum(draft.tankVolume);
    var tankCapacity = parseNum(draft.tankCapacity != null ? draft.tankCapacity : settings.capacity);

    // Negative value checks
    if (feed !== null && feed < 0) errors.feed = 'Feed volume cannot be negative.';
    if (pur !== null && pur < 0) errors.pur = 'Purified volume cannot be negative.';
    if (rej !== null && rej < 0) errors.rej = 'Reject volume cannot be negative.';
    if (rejCollected !== null && rejCollected < 0) errors.rejCollected = 'Collected volume cannot be negative.';
    if (rejReused !== null && rejReused < 0) errors.rejReused = 'Reused volume cannot be negative.';
    if (tds !== null && tds < 0) errors.tds = 'Input TDS cannot be negative.';
    if (ntu !== null && ntu < 0) errors.ntu = 'Input turbidity cannot be negative.';
    if (ptds !== null && ptds < 0) errors.ptds = 'Product-water TDS cannot be negative.';
    if (feedFlow !== null && feedFlow < 0) errors.feedFlow = 'Flow rate cannot be negative.';
    if (rejFlow !== null && rejFlow < 0) errors.rejFlow = 'Flow rate cannot be negative.';
    if (purFlow !== null && purFlow < 0) errors.purFlow = 'Flow rate cannot be negative.';
    if (tankVolume !== null && tankVolume < 0) errors.tankVolume = 'Tank volume cannot be negative.';

    // Required fields check (feed, pur, rej, tds, ntu)
    var reqKeys = [
      { k: 'feed', l: 'Feed water volume' },
      { k: 'pur', l: 'Purified water volume' },
      { k: 'rej', l: 'Reject water generated' },
      { k: 'tds', l: 'Input water TDS' },
      { k: 'ntu', l: 'Input water turbidity' }
    ];

    var hasMissingRequired = false;
    reqKeys.forEach(function (req) {
      if (draft[req.k] === null || draft[req.k] === undefined || draft[req.k] === '') {
        hasMissingRequired = true;
        if (!allowIncomplete) {
          errors[req.k] = req.l + ' is required for a complete test.';
        } else {
          warnings[req.k] = req.l + ' omitted — record will be marked Incomplete.';
        }
      }
    });

    // 3. Purified volume vs Feed volume
    if (feed !== null && pur !== null && pur > feed) {
      errors.pur = 'Purified volume (' + pur + ' L) cannot exceed feed volume (' + feed + ' L).';
    }

    // 4. Reject volume vs Feed volume
    if (feed !== null && rej !== null && rej > feed) {
      errors.rej = 'Reject volume (' + rej + ' L) cannot exceed feed volume (' + feed + ' L).';
    }

    // 5. Water balance difference
    if (feed !== null && pur !== null && rej !== null) {
      var diff = feed - pur - rej;
      if (Math.abs(diff) > 0.5 && feed > 0 && (Math.abs(diff) / feed) > 0.15) {
        warnings.balance = 'Water balance difference is ' + diff.toFixed(1) + ' L (' + Math.round((Math.abs(diff) / feed) * 100) + '% of feed). Verify measurements.';
      }
    }

    // 6. Tank and collection validations
    if (tankCapacity !== null && tankCapacity <= 0) {
      errors.tankCapacity = 'Tank capacity must be greater than zero.';
    }
    if (tankVolume !== null && tankCapacity !== null && tankVolume > tankCapacity) {
      errors.tankVolume = 'Current tank volume (' + tankVolume + ' L) cannot exceed total capacity (' + tankCapacity + ' L).';
    }

    // 7. Reject collection & reuse validations
    if (rej !== null && rejCollected !== null && rejCollected > rej) {
      errors.rejCollected = 'Collected reject (' + rejCollected + ' L) cannot exceed generated reject (' + rej + ' L).';
    }

    var availableCollected = (rejCollected != null ? rejCollected : (rej != null ? rej : 0)) + (currentTankInventory || 0);
    if (rejReused !== null && rejCollected !== null && rejReused > rejCollected) {
      errors.rejReused = 'Reused reject (' + rejReused + ' L) cannot exceed collected reject (' + rejCollected + ' L).';
    }

    // Check individual reuse entries if array
    if (Array.isArray(draft.reuses)) {
      draft.reuses.forEach(function (r, idx) {
        var rVol = parseNum(r.vol);
        if (rVol === null || rVol <= 0) {
          errors['reuse_' + idx + '_vol'] = 'Enter a valid reuse volume greater than 0.';
        }
        if (!r.use || !String(r.use).trim()) {
          errors['reuse_' + idx + '_use'] = 'Specify the non-potable reuse purpose.';
        }
      });
    }

    // 8. Quality readings sanity check
    if (tds !== null && ptds !== null && ptds > tds) {
      warnings.ptds = 'Product TDS (' + ptds + ' ppm) is higher than Input TDS (' + tds + ' ppm). Check RO membrane or sensors.';
    }

    var isValid = Object.keys(errors).length === 0;

    return {
      isValid: isValid,
      hasMissingRequired: hasMissingRequired,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Validate Device Settings
   */
  function validateSettings(draft) {
    var errors = {};
    if (!draft.name || !String(draft.name).trim()) {
      errors.name = 'Device name is required.';
    }
    var cap = parseNum(draft.capacity);
    if (cap === null || cap <= 0) {
      errors.capacity = 'Capacity must be greater than 0 L.';
    }
    var thr = parseNum(draft.threshold);
    if (thr === null || thr < 1 || thr > 100) {
      errors.threshold = 'Alert threshold must be between 1% and 100%.';
    }
    var fr = parseNum(draft.freshness);
    if (fr === null || fr < 1 || fr > 1440) {
      errors.freshness = 'Freshness window must be between 1 and 1440 minutes.';
    }
    var lo = parseNum(draft.baseLo);
    var hi = parseNum(draft.baseHi);
    if (lo === null || lo <= 0 || lo >= 100) {
      errors.baseLo = 'Recovery low must be between 0% and 100%.';
    }
    if (hi === null || hi <= 0 || hi > 100) {
      errors.baseHi = 'Recovery high must be between 0% and 100%.';
    }
    if (lo !== null && hi !== null && hi <= lo) {
      errors.baseHi = 'Baseline high must be greater than baseline low.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  return {
    parseNum: parseNum,
    validateRecord: validateRecord,
    validateSettings: validateSettings
  };
});
