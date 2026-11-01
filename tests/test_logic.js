/**
 * Unit tests for RejectWise calculations, models, validation, alerts, and storage.
 */
const assert = require('assert');
const models = require('../app/models.js');
const calc = require('../app/calculations.js');
const val = require('../app/validation.js');
const alertsEngine = require('../app/alerts.js');
const storage = require('../app/storage.js');

console.log('--- Testing Calculations ---');

// 1. Recovery calculation: 2.5 L / 4.1 L * 100 = 60.975... -> 61.0%
const rec = calc.calculateRecovery(2.5, 4.1);
assert.strictEqual(rec, 61.0, 'Recovery rate should be 61.0%');
console.log('✓ calculateRecovery(2.5, 4.1) =', rec);

// Divide by zero check
assert.strictEqual(calc.calculateRecovery(2.5, 0), null, 'Divide by zero should return null');
assert.strictEqual(calc.calculateRecovery(-1, 4), null, 'Negative purified should return null');
console.log('✓ Recovery guard tests passed');

// 2. Reject fraction: 1.6 / 4.1 * 100 = 39.0%
const frac = calc.calculateRejectFraction(1.6, 4.1);
assert.strictEqual(frac, 39.0, 'Reject fraction should be 39.0%');
console.log('✓ calculateRejectFraction(1.6, 4.1) =', frac);

// 3. Balance difference
const bal1 = calc.calculateBalanceDifference(4.1, 2.5, 1.6);
assert.strictEqual(bal1, 0, 'Exact balance difference should be 0');
const bal2 = calc.calculateBalanceDifference(5.0, 3.0, 1.5);
assert.strictEqual(bal2, 0.5, 'Balance diff should be 0.5 L');
console.log('✓ calculateBalanceDifference passed');

// 4. Tank fill
const fill = calc.calculateTankFill(14.4, 20);
assert.strictEqual(fill, 72.0, 'Tank fill should be 72%');
const curVol = calc.calculateCurrentVolume(72, 20);
assert.strictEqual(curVol, 14.4, 'Current volume should be 14.4 L');
const rem = calc.calculateRemainingCapacity(20, 14.4);
assert.strictEqual(rem, 5.6, 'Remaining capacity should be 5.6 L');
console.log('✓ Tank fill & remaining capacity calculations passed');

// 5. Test status detection: Normal case
const normalRecord = { feed: 4.1, pur: 2.5, rej: 1.6, tds: 480, ntu: 2.0 };
const statusNormal = calc.determineTestStatus(normalRecord, { baseLo: 60.5, baseHi: 63.0 });
assert.strictEqual(statusNormal.status, 'Within baseline');
console.log('✓ Normal status detection passed:', statusNormal.status);

// Test status detection: Incomplete case (missing turbidity)
const incompleteRecord = { feed: 4.1, pur: 2.5, rej: 1.6, tds: 480, ntu: null };
const statusIncomp = calc.determineTestStatus(incompleteRecord, { baseLo: 60.5, baseHi: 63.0 });
assert.strictEqual(statusIncomp.status, 'Incomplete');
assert(statusIncomp.reasons[0].includes('Input turbidity'), 'Should cite missing turbidity');
console.log('✓ Incomplete status detection passed:', statusIncomp.status, statusIncomp.reasons[0]);

// Test status detection: Change detected (recovery 59.0% < 60.5%)
const lowRecRecord = { feed: 4.4, pur: 2.6, rej: 1.8, tds: 505, ntu: 2.5 };
const statusLow = calc.determineTestStatus(lowRecRecord, { baseLo: 60.5, baseHi: 63.0 });
assert.strictEqual(statusLow.status, 'Change detected');
assert.strictEqual(statusLow.triggeredMetric, 'Recovery rate');
console.log('✓ Change detected status passed:', statusLow.status, statusLow.observedValue);

console.log('\n--- Testing Validation ---');
const validDraft = {
  deviceId: 'unit-01',
  testDate: '2026-10-31',
  testTime: '10:00',
  feed: '4.5',
  pur: '2.8',
  rej: '1.7',
  rejCollected: '1.7',
  rejReused: '1.0',
  tds: '480',
  ntu: '2.0',
  tankVolume: '14.0',
  tankCapacity: '20'
};
const valResult = val.validateRecord(validDraft, { capacity: 20 }, 0, false);
assert.strictEqual(valResult.isValid, true);
console.log('✓ Valid draft passed');

// Invalid draft: negative values, pur > feed, reused > collected
const invalidDraft = {
  deviceId: 'unit-01',
  testDate: '2026-10-31',
  testTime: '10:00',
  feed: '4.0',
  pur: '5.0', // > feed
  rej: '-1.0', // negative
  rejCollected: '1.0',
  rejReused: '2.0', // > collected
  tds: '-50', // negative
  ntu: '2.0',
  tankVolume: '25', // > capacity
  tankCapacity: '20'
};
const valResultBad = val.validateRecord(invalidDraft, { capacity: 20 }, 0, false);
assert.strictEqual(valResultBad.isValid, false);
assert(valResultBad.errors.pur, 'pur error expected');
assert(valResultBad.errors.rej, 'rej error expected');
assert(valResultBad.errors.tds, 'tds error expected');
assert(valResultBad.errors.tankVolume, 'tank volume error expected');
assert(valResultBad.errors.rejReused, 'rej reused error expected');
console.log('✓ Invalid draft errors correctly caught:', Object.keys(valResultBad.errors));

console.log('\n--- Testing Storage & Persistence ---');
const seed = storage.resetToDemo();
assert(seed.records.length >= 30, 'Should have >= 30 records');
assert(seed.devices.length >= 2, 'Should have >= 2 devices');
assert(seed.alerts.length >= 6, 'Should have >= 6 alerts');

const newRecord = models.createTestRecord({
  deviceId: 'unit-01',
  source: 'manual',
  feed: 4.2,
  pur: 2.6,
  rej: 1.6,
  tds: 485,
  ntu: 2.1,
  notes: 'Unit test manual record'
});
storage.createRecord(newRecord);
const fetched = storage.getRecordById(newRecord.id);
assert.strictEqual(fetched.id, newRecord.id);
assert.strictEqual(fetched.source, 'manual');
console.log('✓ Create & read record passed:', fetched.id, fetched.source);

// Update record
storage.updateRecord(newRecord.id, { notes: 'Updated notes' });
const updated = storage.getRecordById(newRecord.id);
assert.strictEqual(updated.notes, 'Updated notes');
console.log('✓ Update record passed');

// Delete record
const deleted = storage.deleteRecord(newRecord.id);
assert.strictEqual(deleted, true);
assert.strictEqual(storage.getRecordById(newRecord.id), null);
console.log('✓ Delete record passed');

console.log('\nALL UNIT TESTS PASSED SUCCESSFULLY! 🎉');

