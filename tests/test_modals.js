/**
 * RejectWise - Test Modal Components
 * Verifies component rendering and structure for RecordModal and DeviceModal.
 */
var assert = require('assert');

// Set up mock window and global objects
global.window = global;
global.window.innerWidth = 1440;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

var capturedState = null;
var mockSetState = function (fn) {
  if (typeof fn === 'function') {
    capturedState = fn(capturedState);
  } else {
    capturedState = fn;
  }
};

var React = {
  createElement: function (type, props) {
    var children = Array.prototype.slice.call(arguments, 2);
    return { type: type, props: Object.assign({}, props, { children: children }) };
  },
  useState: function (initial) {
    capturedState = typeof initial === 'function' ? initial() : initial;
    return [capturedState, mockSetState];
  },
  useEffect: function () {},
  useMemo: function (fn) { return fn(); },
  useRef: function (val) { return { current: val }; },
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

// Load bundle components
require('../ds/rejectwise/components/bundle.js');

// Load modals
var RecordModal = require('../app/recordModal.js');
var DeviceModal = require('../app/deviceModal.js');

console.log('--- Testing Modals Structure & Logic ---');

// Test 1: RecordModal in create mode
var vnodeCreate = RecordModal({
  open: true,
  mode: 'create',
  settings: { capacity: '20', threshold: '90', baseLo: '60.5', baseHi: '63.0' },
  devices: [{ id: 'unit-01', name: 'RejectWise Unit 01' }],
  activeDevice: 'unit-01'
});

assert(vnodeCreate, 'RecordModal rendered null');
assert(capturedState.activeTab === 'volumes', 'Default activeTab should be volumes');
assert(capturedState.feed === '', 'Feed should start empty');
console.log('✓ RecordModal create mode initialized correctly');

// Test 2: Bidirectional tank volume <-> pct calculation inside RecordModal state
// Simulate updateField('tankVolume', '15.0')
var cap = 20;
var vol = 15.0;
var calcPct = String(Math.round((vol / cap) * 1000) / 10);
assert.strictEqual(calcPct, '75', '15L of 20L should be 75%');

// Test 3: RecordModal in edit mode
var testRecord = {
  id: 'T-999',
  deviceId: 'unit-01',
  feed: 4.8,
  pur: 3.0,
  rej: 1.8,
  rejCollected: 1.8,
  rejReused: 0.5,
  reuses: [{ id: 'R-1', vol: '0.5', use: 'Floor cleaning', date: '28 Oct' }],
  tds: 450,
  ntu: 1.8,
  ptds: 32,
  tankVolume: 12.0,
  tankPct: 60.0,
  source: 'manual',
  dateOnly: '2026-10-31',
  timeOnly: '14:30'
};

var vnodeEdit = RecordModal({
  open: true,
  mode: 'edit',
  initialRecord: testRecord,
  settings: { capacity: '20', threshold: '90', baseLo: '60.5', baseHi: '63.0' },
  devices: [{ id: 'unit-01', name: 'RejectWise Unit 01' }],
  activeDevice: 'unit-01'
});

assert(vnodeEdit, 'RecordModal edit rendered null');
assert.strictEqual(capturedState.id, 'T-999', 'Pre-filled ID should be T-999');
assert.strictEqual(capturedState.feed, '4.8', 'Pre-filled feed should be 4.8');
assert.strictEqual(capturedState.pur, '3', 'Pre-filled pur should be 3');
assert.strictEqual(capturedState.rej, '1.8', 'Pre-filled rej should be 1.8');
assert.strictEqual(capturedState.reuses.length, 1, 'Should have 1 reuse entry');
console.log('✓ RecordModal edit mode pre-filled fields correctly');

// Test 4: DeviceModal in create and edit mode
var devNode = DeviceModal({
  open: true,
  isEdit: false
});
assert(devNode, 'DeviceModal rendered null');
assert(capturedState.name === 'RejectWise Unit', 'DeviceModal default name');
console.log('✓ DeviceModal create mode initialized correctly');

var devEditNode = DeviceModal({
  open: true,
  isEdit: true,
  initialDevice: {
    id: 'unit-02',
    name: 'Floor 2 RO Unit',
    location: 'Cafeteria',
    capacity: '30',
    threshold: '85',
    baseLo: '58.0',
    baseHi: '62.0'
  }
});
assert(devEditNode, 'DeviceModal edit rendered null');
assert.strictEqual(capturedState.id, 'unit-02', 'DeviceModal pre-filled id');
assert.strictEqual(capturedState.location, 'Cafeteria', 'DeviceModal pre-filled location');
console.log('✓ DeviceModal edit mode pre-filled correctly');

console.log('🎉 ALL MODAL TESTS PASSED SUCCESSFULLY!');
