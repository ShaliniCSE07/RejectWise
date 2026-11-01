/**
 * End-to-end simulation of the RejectWise application logic and React component lifecycle.
 */
const assert = require('assert');
const fs = require('fs');

// Set up mock window and global objects
global.window = global;
global.window.innerWidth = 1440;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

// Mock React
const React = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
  useRef: (val) => ({ current: val }),
  Component: class { constructor(props) { this.props = props; } }
};
global.React = React;
global.window.React = React;

// Load app modules
require('../app/models.js');
require('../app/calculations.js');
require('../app/validation.js');
require('../app/alerts.js');
require('../app/storage.js');
require('../app/recordModal.js');
require('../app/deviceModal.js');

// Mock DCLogic class from support.js
class DCLogic {
  constructor(props) {
    this.props = props || {};
    this.state = {};
  }
  setState(patch, cb) {
    if (typeof patch === 'function') {
      this.state = Object.assign({}, this.state, patch(this.state));
    } else {
      this.state = Object.assign({}, this.state, patch);
    }
    if (cb) cb();
  }
  forceUpdate() {}
}

// Load Component from Main.dc.html
const content = fs.readFileSync('Main.dc.html', 'utf8');
const scriptStart = content.indexOf('<script type="text/x-dc" data-dc-script');
const codeStart = content.indexOf('>', scriptStart) + 1;
const codeEnd = content.indexOf('</script>', codeStart);
const code = content.slice(codeStart, codeEnd);

const ComponentClass = new Function('DCLogic', 'StreamableLogic', 'React', code + '\nreturn Component;')(DCLogic, DCLogic, React);

console.log('✓ Successfully loaded ComponentClass from Main.dc.html');

// Instantiate component
const comp = new ComponentClass({});
console.log('✓ Component instantiated. Active device:', comp.state.device);

// Test renderVals across all 9 pages!
const pages = ['overview', 'live', 'quality', 'recovery', 'trends', 'history', 'alerts', 'reports', 'settings'];
pages.forEach(p => {
  comp.setState({ page: p });
  const vals = comp.renderVals();
  assert(vals, 'renderVals should return an object for page: ' + p);
  assert.strictEqual(vals.page, p, 'Page should match: ' + p);
  console.log(`✓ Page [${p}] renderVals executed successfully. Page title: "${vals.pageTitle}"`);
});

console.log('\n--- Testing Adding Test Records ---');

// 1. Normal record submission
const initialVals = comp.renderVals();
const initialTestCount = initialVals.activeRecords ? initialVals.activeRecords.length : 30;

const normalRecordPayload = {
  id: 'T-NORMAL-01',
  deviceId: 'unit-01',
  source: 'manual',
  date: '31 Oct 2026, 11:00 AM',
  dateOnly: '2026-10-31',
  timeOnly: '11:00',
  timestamp: new Date('2026-10-31T11:00:00').getTime(),
  cond: 'Municipal supply',
  notes: 'Testing manual normal entry',
  feed: 4.5,
  pur: 2.8,
  rej: 1.7,
  rejCollected: 1.7,
  rejReused: 1.0,
  reuses: [{ id: 'R-N1', vol: 1.0, use: 'Floor cleaning', date: '31 Oct, 11:15 AM' }],
  tds: 480,
  ntu: 2.0,
  ptds: 34,
  feedFlow: 0.62,
  rejFlow: 0.24,
  tankVolume: 15.0,
  tankPct: 75,
  tankCapacity: 20
};

initialVals.handleSaveRecord(normalRecordPayload);
console.log('✓ Saved normal record. New active records in storage:', window.RejectWiseApp.storage.getRecords('unit-01').length);

const afterNormalVals = comp.renderVals();
assert(afterNormalVals.latestTests[0].id === 'T-NORMAL-01', 'Latest test should be T-NORMAL-01');
assert.strictEqual(afterNormalVals.latestTests[0].note, 'Within baseline', 'Status should be Within baseline');
console.log('✓ Normal record verified in dashboard headlines and latest runs table!');

// 2. Incomplete record submission (missing turbidity & TDS)
const incompleteRecordPayload = {
  id: 'T-INCOMPLETE-01',
  deviceId: 'unit-01',
  source: 'manual',
  date: '31 Oct 2026, 02:00 PM',
  dateOnly: '2026-10-31',
  timeOnly: '14:00',
  timestamp: new Date('2026-10-31T14:00:00').getTime(),
  cond: 'Municipal supply',
  notes: 'Omitted optional/turbidity measurements',
  feed: 4.2,
  pur: 2.6,
  rej: 1.6,
  rejCollected: 1.6,
  rejReused: 0,
  reuses: [],
  tds: null,
  ntu: null,
  ptds: null,
  feedFlow: null,
  rejFlow: null,
  tankVolume: 16.0,
  tankPct: 80,
  tankCapacity: 20
};

afterNormalVals.handleSaveRecord(incompleteRecordPayload);
const afterIncompVals = comp.renderVals();
assert(afterIncompVals.latestTests[0].id === 'T-INCOMPLETE-01', 'Latest test should be T-INCOMPLETE-01');
assert.strictEqual(afterIncompVals.latestTests[0].note, 'Incomplete', 'Status should be Incomplete');
console.log('✓ Incomplete record verified. Marked Incomplete without crashing calculations!');

// 3. Change-detected record submission (Recovery 55% < 60.5%)
const changeDetectedPayload = {
  id: 'T-FLAG-01',
  deviceId: 'unit-01',
  source: 'manual',
  date: '31 Oct 2026, 05:00 PM',
  dateOnly: '2026-10-31',
  timeOnly: '17:00',
  timestamp: new Date('2026-10-31T17:00:00').getTime(),
  cond: 'Borewell blend',
  notes: 'Low recovery due to high TDS and low pressure',
  feed: 5.0,
  pur: 2.7, // 2.7 / 5.0 = 54.0%
  rej: 2.3,
  rejCollected: 2.3,
  rejReused: 0,
  reuses: [],
  tds: 530,
  ntu: 2.8,
  ptds: 45,
  feedFlow: 0.55,
  rejFlow: 0.28,
  tankVolume: 18.5,
  tankPct: 92.5, // >= 90% threshold -> triggers tank alert!
  tankCapacity: 20
};

afterIncompVals.handleSaveRecord(changeDetectedPayload);
const afterFlagVals = comp.renderVals();
assert(afterFlagVals.latestTests[0].id === 'T-FLAG-01', 'Latest test should be T-FLAG-01');
assert.strictEqual(afterFlagVals.latestTests[0].note, 'Change detected', 'Status should be Change detected');
console.log('✓ Change-detected record verified!');

// Check that alert was automatically generated for this low recovery and tank level!
const activeAlerts = window.RejectWiseApp.storage.getAlerts('unit-01').filter(a => a.status !== 'resolved');
console.log('✓ Active alerts count:', activeAlerts.length);
assert(activeAlerts.some(a => a.related === 'T-FLAG-01' || a.kind === 'test'), 'Should have generated a test flag alert');
console.log('✓ Automatic alert generation verified!');

// 4. Test Record Deletion
console.log('\n--- Testing Record Deletion ---');
comp.setState({ deleteRecordId: 'T-FLAG-01' });
afterFlagVals.doDeleteTest();
const afterDeleteVals = comp.renderVals();
assert.strictEqual(window.RejectWiseApp.storage.getRecordById('T-FLAG-01'), null, 'T-FLAG-01 should be deleted');
assert.notStrictEqual(afterDeleteVals.latestTests[0].id, 'T-FLAG-01', 'T-FLAG-01 should no longer be latest');
console.log('✓ Record deletion verified and dashboard recalculated!');

// 5. Test Device Management
console.log('\n--- Testing Device Management ---');
afterDeleteVals.handleSaveDevice({
  id: 'unit-03',
  name: 'RejectWise Unit 03 (Kitchen Bay)',
  location: 'Cafeteria Kitchen',
  capacity: '25',
  threshold: '85',
  baseLo: '58.0',
  baseHi: '62.0'
});

const dev3Vals = comp.renderVals();
assert.strictEqual(dev3Vals.device, 'unit-03');
assert.strictEqual(dev3Vals.deviceName, 'RejectWise Unit 03 (Kitchen Bay)');
assert.strictEqual(dev3Vals.hasData, false, 'New device should start with no data');
assert.strictEqual(dev3Vals.showEmpty, true, 'Should show clean empty state for new device');
console.log('✓ Device creation and switching verified!');

// Add a test record to unit-03
dev3Vals.handleSaveRecord({
  id: 'T-U3-001',
  deviceId: 'unit-03',
  source: 'manual',
  date: '31 Oct 2026, 06:00 PM',
  dateOnly: '2026-10-31',
  timeOnly: '18:00',
  timestamp: Date.now(),
  cond: 'Kitchen line',
  feed: 10.0,
  pur: 6.0,
  rej: 4.0,
  rejCollected: 4.0,
  rejReused: 2.0,
  reuses: [{ id: 'R-U3-1', vol: 2.0, use: 'Floor wash', date: '31 Oct, 6:30 PM' }],
  tds: 350,
  ntu: 1.5,
  ptds: 25,
  tankVolume: 10.0,
  tankPct: 40,
  tankCapacity: 25
});

const dev3AfterTest = comp.renderVals();
assert.strictEqual(dev3AfterTest.hasData, true, 'unit-03 should now have active data');
assert.strictEqual(dev3AfterTest.tot.feed, 10.0, 'Feed should be 10.0 L');
assert.strictEqual(dev3AfterTest.tot.pur, 6.0, 'Purified should be 6.0 L');
assert.strictEqual(dev3AfterTest.tot.rec, 60.0, 'Recovery should be 60.0%');
console.log('✓ Device-specific isolated data verified (Feed: 10 L, Recovery: 60.0%)!');

// 6. Test Period Filtering (24h, 7d, 30d, custom)
console.log('\n--- Testing Period Filtering ---');
comp.setState({ device: 'unit-01', range: '24h' });
const vals24h = comp.renderVals();
assert.strictEqual(vals24h.range, '24h');
assert(vals24h.rows.length === 12, '24h should have 12 2-hour buckets');
console.log('✓ 24h filter verified (12 buckets)');

comp.setState({ range: '30d' });
const vals30d = comp.renderVals();
assert.strictEqual(vals30d.range, '30d');
assert(vals30d.rows.length > 0, '30d rows should exist');
console.log('✓ 30d filter verified');

comp.setState({ range: 'custom', customStart: '2026-10-25', customEnd: '2026-10-29' });
const valsCustom = comp.renderVals();
assert.strictEqual(valsCustom.range, 'custom');
console.log('✓ Custom range filter verified');

console.log('\n🎉 ALL END-TO-END APPLICATION WORKFLOW TESTS PASSED PERFECTLY!');

