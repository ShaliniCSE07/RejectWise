/**
 * RejectWise - Interactive Record Modal Component
 * Supports creating, editing, validating, and calculating test records with multiple sections:
 * - Device & Session Information
 * - Input Water Measurements
 * - Purified Water Measurements
 * - Reject Water & Multiple Reuse Entries
 * - Storage Tank Level (with bidirectional volume <-> fill % calculation)
 * - Additional Sensor Readings & Availability toggles
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.recordModal = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var React = window.React || (typeof require !== 'undefined' ? require('react') : null);
  var h = React ? React.createElement : null;

  function RecordModal(props) {
    if (!props.open) return null;

    var RW = window.RejectWise || {};
    var calc = (window.RejectWiseApp && window.RejectWiseApp.calculations) || {};
    var valEngine = (window.RejectWiseApp && window.RejectWiseApp.validation) || {};

    var mode = props.mode || 'create'; // 'create' | 'edit'
    var initial = props.initialRecord || {};
    var settings = props.settings || {};
    var devices = props.devices || [];
    var activeDevice = props.activeDevice || 'unit-01';

    // State for the form
    var stateHook = React.useState(function () {
      var now = new Date();
      var yyyy = now.getFullYear();
      var mm = String(now.getMonth() + 1).padStart(2, '0');
      var dd = String(now.getDate()).padStart(2, '0');
      var hh = String(now.getHours()).padStart(2, '0');
      var min = String(now.getMinutes()).padStart(2, '0');

      var cap = settings.capacity ? parseFloat(settings.capacity) : 20;

      return {
        activeTab: 'volumes', // 'device' | 'volumes' | 'quality' | 'reject' | 'tank'
        id: initial.id || '',
        deviceId: initial.deviceId || activeDevice,
        testDate: initial.dateOnly ? initial.dateOnly : (yyyy + '-' + mm + '-' + dd),
        testTime: initial.timeOnly ? initial.timeOnly : (hh + ':' + min),
        cond: initial.cond || 'Municipal supply',
        notes: initial.notes || '',
        source: initial.source || 'manual',

        // Volumes
        feed: initial.feed != null ? String(initial.feed) : '',
        pur: initial.pur != null ? String(initial.pur) : '',
        rej: initial.rej != null ? String(initial.rej) : '',
        rejCollected: initial.rejCollected != null ? String(initial.rejCollected) : (initial.rej != null ? String(initial.rej) : ''),

        // Quality
        tds: initial.tds != null ? String(initial.tds) : '',
        ptds: initial.ptds != null ? String(initial.ptds) : '',
        ntu: initial.ntu != null ? String(initial.ntu) : '',

        // Flows
        feedFlow: initial.feedFlow != null ? String(initial.feedFlow) : '',
        rejFlow: initial.rejFlow != null ? String(initial.rejFlow) : '',
        purFlow: initial.purFlow != null ? String(initial.purFlow) : '',

        // Tank
        tankId: initial.tankId || 'TK-01',
        tankLocation: initial.tankLocation || 'Purifier output bay',
        tankCapacity: initial.tankCapacity != null ? String(initial.tankCapacity) : String(cap),
        tankVolume: initial.tankVolume != null ? String(initial.tankVolume) : '14.4',
        tankPct: initial.tankPct != null ? String(initial.tankPct) : '72',
        tankThreshold: initial.tankThreshold != null ? String(initial.tankThreshold) : (settings.threshold || '90'),

        // Sensor availability toggles
        sensorsAvailable: {
          inTds: initial.tds != null || true,
          inNtu: initial.ntu != null || true,
          prodTds: initial.ptds != null || true,
          feedFlow: initial.feedFlow != null || true,
          rejFlow: initial.rejFlow != null || true,
          purFlow: initial.purFlow != null || false
        },

        // Reuses list
        reuses: Array.isArray(initial.reuses) && initial.reuses.length > 0
          ? initial.reuses.map(function (r) {
              return { id: r.id || 'R-' + Date.now(), vol: String(r.vol || ''), use: r.use || 'Floor cleaning', date: r.date || (dd + ' Oct, ' + hh + ':' + min) };
            })
          : [
              { id: 'R-1', vol: initial.rejReused ? String(initial.rejReused) : '', use: 'Floor cleaning', date: dd + ' Oct, ' + hh + ':' + min }
            ],

        errors: {},
        warnings: {}
      };
    });

    var form = stateHook[0];
    var setForm = stateHook[1];

    // Helper to update form fields
    function updateField(k, v) {
      setForm(function (prev) {
        var next = Object.assign({}, prev);
        next[k] = v;

        // Auto-sync reject collected when reject generated is typed if collected is blank or equal
        if (k === 'rej' && (!prev.rejCollected || prev.rejCollected === prev.rej)) {
          next.rejCollected = v;
        }

        // Bidirectional Tank calculation
        var cap = parseFloat(next.tankCapacity) || (settings.capacity ? parseFloat(settings.capacity) : 20);
        if (k === 'tankVolume') {
          var vol = parseFloat(v);
          if (!isNaN(vol) && cap > 0) {
            next.tankPct = String(Math.round((vol / cap) * 1000) / 10);
          } else if (v === '') {
            next.tankPct = '';
          }
        } else if (k === 'tankPct') {
          var pct = parseFloat(v);
          if (!isNaN(pct) && cap > 0) {
            next.tankVolume = String(Math.round(((pct / 100) * cap) * 10) / 10);
          } else if (v === '') {
            next.tankVolume = '';
          }
        } else if (k === 'tankCapacity') {
          var newCap = parseFloat(v);
          var vol = parseFloat(next.tankVolume);
          if (!isNaN(vol) && newCap > 0) {
            next.tankPct = String(Math.round((vol / newCap) * 1000) / 10);
          }
        }

        return next;
      });
    }

    // Reuse entries management
    function addReuseEntry() {
      setForm(function (prev) {
        var list = prev.reuses.slice();
        list.push({
          id: 'R-' + (list.length + 1) + '-' + Date.now().toString(36).slice(-3),
          vol: '',
          use: 'Garden watering',
          date: form.testDate + ', ' + form.testTime
        });
        return Object.assign({}, prev, { reuses: list });
      });
    }

    function removeReuseEntry(idx) {
      setForm(function (prev) {
        var list = prev.reuses.filter(function (_, i) { return i !== idx; });
        return Object.assign({}, prev, { reuses: list });
      });
    }

    function updateReuseEntry(idx, field, value) {
      setForm(function (prev) {
        var list = prev.reuses.map(function (item, i) {
          if (i !== idx) return item;
          var updated = Object.assign({}, item);
          updated[field] = value;
          return updated;
        });
        return Object.assign({}, prev, { reuses: list });
      });
    }

    // Toggle sensor availability
    function toggleSensorAvailable(sensorKey) {
      setForm(function (prev) {
        var sa = Object.assign({}, prev.sensorsAvailable);
        sa[sensorKey] = !sa[sensorKey];
        var next = Object.assign({}, prev, { sensorsAvailable: sa });
        if (!sa[sensorKey]) {
          // Clear field when marked unavailable
          if (sensorKey === 'inTds') next.tds = '';
          if (sensorKey === 'inNtu') next.ntu = '';
          if (sensorKey === 'prodTds') next.ptds = '';
          if (sensorKey === 'feedFlow') next.feedFlow = '';
          if (sensorKey === 'rejFlow') next.rejFlow = '';
          if (sensorKey === 'purFlow') next.purFlow = '';
        }
        return next;
      });
    }

    // Real-time automatic calculations
    var fVol = parseFloat(form.feed);
    var pVol = parseFloat(form.pur);
    var rVol = parseFloat(form.rej);
    var tCap = parseFloat(form.tankCapacity) || 20;
    var tVol = parseFloat(form.tankVolume);

    var liveRecovery = (!isNaN(pVol) && !isNaN(fVol) && fVol > 0) ? (pVol / fVol * 100) : null;
    var liveRejectFrac = (!isNaN(rVol) && !isNaN(fVol) && fVol > 0) ? (rVol / fVol * 100) : null;
    var liveBalDiff = (!isNaN(fVol) && !isNaN(pVol) && !isNaN(rVol)) ? (fVol - pVol - rVol) : null;
    var liveTankPct = (!isNaN(tVol) && tCap > 0) ? (tVol / tCap * 100) : null;
    var liveRemainingCap = (!isNaN(tVol) && tCap > 0) ? Math.max(0, tCap - tVol) : null;

    var totalReusedL = form.reuses.reduce(function (sum, r) {
      var n = parseFloat(r.vol);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    // Live test status evaluation
    var testStatusEval = calc.determineTestStatus
      ? calc.determineTestStatus({
          feed: fVol, pur: pVol, rej: rVol,
          tds: form.sensorsAvailable.inTds ? parseFloat(form.tds) : null,
          ntu: form.sensorsAvailable.inNtu ? parseFloat(form.ntu) : null,
          recoveryRate: liveRecovery
        }, settings)
      : { status: 'Within baseline', tone: 'normal' };

    // Submission handler
    function handleSubmit(allowIncomplete) {
      // Validate
      var res = valEngine.validateRecord
        ? valEngine.validateRecord(form, settings, 0, allowIncomplete)
        : { isValid: true, errors: {}, warnings: {} };

      if (!res.isValid) {
        setForm(function (prev) { return Object.assign({}, prev, { errors: res.errors, warnings: res.warnings }); });
        return;
      }

      // Compile final record payload
      var recordPayload = {
        id: form.id || ('T-' + Math.floor(Math.random() * 900 + 100)),
        deviceId: form.deviceId,
        source: form.source || 'manual',
        date: form.testDate + ', ' + form.testTime,
        dateOnly: form.testDate,
        timeOnly: form.testTime,
        timestamp: new Date(form.testDate + 'T' + form.testTime).getTime() || Date.now(),
        cond: form.cond,
        notes: form.notes,

        feed: !isNaN(fVol) ? fVol : null,
        pur: !isNaN(pVol) ? pVol : null,
        rej: !isNaN(rVol) ? rVol : null,
        rejCollected: parseFloat(form.rejCollected) || rVol || 0,
        rejReused: totalReusedL,
        reuses: form.reuses.filter(function (r) { return parseFloat(r.vol) > 0; }).map(function (r) {
          return { id: r.id, vol: parseFloat(r.vol), use: r.use, date: r.date || (form.testDate + ', ' + form.testTime) };
        }),

        tds: form.sensorsAvailable.inTds && !isNaN(parseFloat(form.tds)) ? parseFloat(form.tds) : null,
        ntu: form.sensorsAvailable.inNtu && !isNaN(parseFloat(form.ntu)) ? parseFloat(form.ntu) : null,
        ptds: form.sensorsAvailable.prodTds && !isNaN(parseFloat(form.ptds)) ? parseFloat(form.ptds) : null,

        feedFlow: form.sensorsAvailable.feedFlow && !isNaN(parseFloat(form.feedFlow)) ? parseFloat(form.feedFlow) : null,
        rejFlow: form.sensorsAvailable.rejFlow && !isNaN(parseFloat(form.rejFlow)) ? parseFloat(form.rejFlow) : null,
        purFlow: form.sensorsAvailable.purFlow && !isNaN(parseFloat(form.purFlow)) ? parseFloat(form.purFlow) : null,

        tankVolume: !isNaN(tVol) ? tVol : null,
        tankPct: liveTankPct != null ? Math.round(liveTankPct * 10) / 10 : null,
        tankCapacity: tCap,

        recoveryRate: liveRecovery != null ? Math.round(liveRecovery * 10) / 10 : null,
        rejectFraction: liveRejectFrac != null ? Math.round(liveRejectFrac * 10) / 10 : null,
        balanceDiff: liveBalDiff != null ? Math.round(liveBalDiff * 100) / 100 : null,
        status: testStatusEval.status,
        statusDetails: testStatusEval
      };

      if (props.onSave) {
        props.onSave(recordPayload);
      }
    }

    // Styles
    var scrimStyle = {
      position: 'fixed', inset: 0, background: 'rgba(16, 56, 45, 0.45)', zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box'
    };
    var modalStyle = {
      background: 'var(--surface)', borderRadius: '12px', width: '100%', maxWidth: '880px',
      maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-popover)',
      border: '1px solid var(--border)', overflow: 'hidden'
    };
    var headStyle = {
      padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: 'var(--surface-raised)'
    };
    var bodyStyle = {
      padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1
    };
    var footStyle = {
      padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'var(--surface-raised)', flexWrap: 'wrap'
    };
    var bannerStyle = {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px',
      padding: '14px 18px', background: 'var(--sand-soft)', border: '1px solid var(--sand)', borderRadius: '8px'
    };
    var navTabStyle = function (active) {
      return {
        padding: '8px 14px', fontSize: '13px', fontWeight: active ? '600' : '500',
        color: active ? 'var(--forest)' : 'var(--ink-secondary)',
        borderBottom: active ? '2px solid var(--forest)' : '2px solid transparent',
        background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
      };
    };
    var grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' };
    var grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' };

    return h('div', { style: scrimStyle, onClick: function (e) { if (e.target === e.currentTarget && props.onCancel) props.onCancel(); } },
      h('div', { style: modalStyle, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rw-modal-title' },

        // Modal Header
        h('div', { style: headStyle },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } },
            h('h2', { id: 'rw-modal-title', style: { margin: 0, fontSize: '20px', fontWeight: '600' } },
              mode === 'edit' ? 'Edit Test Record ' + form.id : 'Add New Test Record'
            ),
            h(RW.DataLabel || 'span', { kind: form.source === 'demo' ? 'demo' : 'live' },
              form.source === 'demo' ? 'Demo Data' : 'Manual Entry'
            )
          ),
          h(RW.Button || 'button', { variant: 'quiet', size: 'sm', icon: 'close', 'aria-label': 'Close dialog', onClick: props.onCancel })
        ),

        // Live Calculations Preview Banner
        h('div', { style: { padding: '12px 24px 0' } },
          h('div', { style: bannerStyle },
            h('div', null,
              h('div', { className: 'eyebrow', style: { fontSize: '11px', color: 'var(--ink-secondary)' } }, 'Test Recovery'),
              h('div', { className: 'mono', style: { fontSize: '20px', fontWeight: '600', color: 'var(--forest)' } },
                liveRecovery != null ? liveRecovery.toFixed(1) + '%' : '—'
              ),
              h(RW.StatusChip || 'span', { tone: testStatusEval.tone, icon: false }, testStatusEval.status)
            ),
            h('div', null,
              h('div', { className: 'eyebrow', style: { fontSize: '11px', color: 'var(--ink-secondary)' } }, 'Reject Fraction'),
              h('div', { className: 'mono', style: { fontSize: '20px', fontWeight: '600', color: 'var(--aqua)' } },
                liveRejectFrac != null ? liveRejectFrac.toFixed(1) + '%' : '—'
              ),
              h('div', { style: { fontSize: '11.5px', color: 'var(--ink-secondary)' } }, 'Of feed water')
            ),
            h('div', null,
              h('div', { className: 'eyebrow', style: { fontSize: '11px', color: 'var(--ink-secondary)' } }, 'Balance Diff'),
              h('div', { className: 'mono', style: { fontSize: '20px', fontWeight: '600', color: (liveBalDiff != null && Math.abs(liveBalDiff) > 0.5) ? 'var(--warning)' : 'var(--ink)' } },
                liveBalDiff != null ? (Math.abs(liveBalDiff) < 0.01 ? '0.0' : liveBalDiff.toFixed(1)) + ' L' : '—'
              ),
              h('div', { style: { fontSize: '11.5px', color: 'var(--ink-secondary)' } }, 'Feed − Pur − Rej')
            ),
            h('div', null,
              h('div', { className: 'eyebrow', style: { fontSize: '11px', color: 'var(--ink-secondary)' } }, 'Tank Fill Level'),
              h('div', { className: 'mono', style: { fontSize: '20px', fontWeight: '600', color: 'var(--ink)' } },
                liveTankPct != null ? liveTankPct.toFixed(1) + '%' : '—'
              ),
              h('div', { style: { fontSize: '11.5px', color: 'var(--ink-secondary)' } },
                tVol != null ? tVol.toFixed(1) + ' L of ' + tCap + ' L' : 'Capacity ' + tCap + ' L'
              )
            ),
            h('div', null,
              h('div', { className: 'eyebrow', style: { fontSize: '11px', color: 'var(--ink-secondary)' } }, 'Remaining Cap'),
              h('div', { className: 'mono', style: { fontSize: '20px', fontWeight: '600', color: 'var(--ink)' } },
                liveRemainingCap != null ? liveRemainingCap.toFixed(1) + ' L' : '—'
              ),
              h('div', { style: { fontSize: '11.5px', color: 'var(--ink-secondary)' } }, 'Available space')
            )
          )
        ),

        // Section Tabs
        h('div', { style: { padding: '4px 24px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', overflowX: 'auto' } },
          h('button', { type: 'button', style: navTabStyle(form.activeTab === 'volumes'), onClick: function () { updateField('activeTab', 'volumes'); } }, '1. Water Volumes'),
          h('button', { type: 'button', style: navTabStyle(form.activeTab === 'quality'), onClick: function () { updateField('activeTab', 'quality'); } }, '2. Water Quality & Flows'),
          h('button', { type: 'button', style: navTabStyle(form.activeTab === 'reject'), onClick: function () { updateField('activeTab', 'reject'); } }, '3. Reject Reuse (' + form.reuses.length + ')'),
          h('button', { type: 'button', style: navTabStyle(form.activeTab === 'tank'), onClick: function () { updateField('activeTab', 'tank'); } }, '4. Tank Information'),
          h('button', { type: 'button', style: navTabStyle(form.activeTab === 'device'), onClick: function () { updateField('activeTab', 'device'); } }, '5. Device & Context')
        ),

        // Modal Body
        h('div', { style: bodyStyle },

          // Tab 1: Water Volumes
          form.activeTab === 'volumes' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            h('div', { style: { fontSize: '13px', color: 'var(--ink-secondary)' } },
              'Enter the measured water volumes for this test run. These are used to calculate recovery, reject fraction and water balance.'
            ),
            h('div', { style: grid3 },
              h(RW.TextField, {
                label: 'Feed water volume (Required)', type: 'number', step: '0.1', unit: 'L',
                placeholder: 'e.g. 4.5', value: form.feed, error: form.errors.feed,
                hint: 'Total water entering the RO unit',
                onChange: function (e) { updateField('feed', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Purified water volume (Required)', type: 'number', step: '0.1', unit: 'L',
                placeholder: 'e.g. 2.8', value: form.pur, error: form.errors.pur,
                hint: 'Product water delivered to tap',
                onChange: function (e) { updateField('pur', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Reject water generated (Required)', type: 'number', step: '0.1', unit: 'L',
                placeholder: 'e.g. 1.7', value: form.rej, error: form.errors.rej,
                hint: 'Waste stream sent to tank or drain',
                onChange: function (e) { updateField('rej', e.target.value); }
              })
            ),
            form.warnings.balance ? h(RW.InlineAlert, { tone: 'warning', title: 'Water Balance Difference' }, form.warnings.balance) : null,
            h('div', { style: { padding: '12px 16px', background: 'var(--canvas)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--ink-secondary)' } },
              'Expected balance formula: Feed volume = Purified volume + Reject generated. A difference may indicate water held in filter housings or meter variance.'
            )
          ) : null,

          // Tab 2: Water Quality & Flows
          form.activeTab === 'quality' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            h('div', { style: { fontSize: '13px', color: 'var(--ink-secondary)' } },
              'Enter available TDS and turbidity measurements. If a sensor is unavailable or not installed, mark it below to exclude it from validation.'
            ),
            h('div', { style: grid3 },
              h('div', null,
                h(RW.TextField, {
                  label: 'Input water TDS', type: 'number', unit: 'ppm',
                  placeholder: 'e.g. 486', value: form.tds, error: form.errors.tds, disabled: !form.sensorsAvailable.inTds,
                  hint: form.sensorsAvailable.inTds ? 'Total dissolved solids before filtration' : 'Sensor marked not configured',
                  onChange: function (e) { updateField('tds', e.target.value); }
                }),
                h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '6px', cursor: 'pointer', color: 'var(--ink-secondary)' } },
                  h('input', { type: 'checkbox', checked: form.sensorsAvailable.inTds, onChange: function () { toggleSensorAvailable('inTds'); } }),
                  'Sensor configured & available'
                )
              ),
              h('div', null,
                h(RW.TextField, {
                  label: 'Input turbidity', type: 'number', step: '0.1', unit: 'NTU',
                  placeholder: 'e.g. 2.1', value: form.ntu, error: form.errors.ntu, disabled: !form.sensorsAvailable.inNtu,
                  hint: form.sensorsAvailable.inNtu ? 'Cloudiness from suspended solids' : 'Sensor marked not configured',
                  onChange: function (e) { updateField('ntu', e.target.value); }
                }),
                h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '6px', cursor: 'pointer', color: 'var(--ink-secondary)' } },
                  h('input', { type: 'checkbox', checked: form.sensorsAvailable.inNtu, onChange: function () { toggleSensorAvailable('inNtu'); } }),
                  'Sensor configured & available'
                )
              ),
              h('div', null,
                h(RW.TextField, {
                  label: 'Product-water TDS (Optional)', type: 'number', unit: 'ppm',
                  placeholder: 'e.g. 34', value: form.ptds, error: form.errors.ptds, disabled: !form.sensorsAvailable.prodTds,
                  hint: form.sensorsAvailable.prodTds ? 'TDS after membrane purification' : 'Sensor marked not configured',
                  onChange: function (e) { updateField('ptds', e.target.value); }
                }),
                h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginTop: '6px', cursor: 'pointer', color: 'var(--ink-secondary)' } },
                  h('input', { type: 'checkbox', checked: form.sensorsAvailable.prodTds, onChange: function () { toggleSensorAvailable('prodTds'); } }),
                  'Sensor configured & available'
                )
              )
            ),
            h('div', { className: 'eyebrow', style: { marginTop: '8px' } }, 'Flow rates (Optional observations)'),
            h('div', { style: grid3 },
              h(RW.TextField, {
                label: 'Feed flow rate', type: 'number', step: '0.01', unit: 'L/min',
                placeholder: 'e.g. 0.62', value: form.feedFlow, error: form.errors.feedFlow,
                onChange: function (e) { updateField('feedFlow', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Purified flow rate', type: 'number', step: '0.01', unit: 'L/min',
                placeholder: 'e.g. 0.38', value: form.purFlow, error: form.errors.purFlow,
                onChange: function (e) { updateField('purFlow', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Reject flow rate', type: 'number', step: '0.01', unit: 'L/min',
                placeholder: 'e.g. 0.24', value: form.rejFlow, error: form.errors.rejFlow,
                onChange: function (e) { updateField('rejFlow', e.target.value); }
              })
            )
          ) : null,

          // Tab 3: Reject & Reuse (supports MULTIPLE reuse entries)
          form.activeTab === 'reject' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            h('div', { style: { fontSize: '13px', color: 'var(--ink-secondary)' } },
              'Reject water is collected in the storage tank and can be logged for non-potable uses. You can record multiple reuse entries below.'
            ),
            h('div', { style: grid2 },
              h(RW.TextField, {
                label: 'Reject water collected into tank', type: 'number', step: '0.1', unit: 'L',
                placeholder: 'e.g. 1.7', value: form.rejCollected, error: form.errors.rejCollected,
                hint: 'Portion of generated reject that reached the tank',
                onChange: function (e) { updateField('rejCollected', e.target.value); }
              }),
              h('div', { style: { padding: '14px 18px', background: 'var(--canvas)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
                h('span', { className: 'eyebrow' }, 'Total Reused Summary'),
                h('span', { className: 'mono', style: { fontSize: '20px', fontWeight: '600', color: 'var(--forest)' } }, totalReusedL.toFixed(1) + ' L'),
                h('span', { style: { fontSize: '12px', color: 'var(--ink-secondary)' } },
                  (parseFloat(form.rejCollected) || 0) >= totalReusedL
                    ? (Math.round(((parseFloat(form.rejCollected) || 0) - totalReusedL) * 10) / 10).toFixed(1) + ' L remaining in tank collection'
                    : 'Warning: total reused exceeds collected volume'
                )
              )
            ),
            h('div', { style: { borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                h('span', { className: 'eyebrow' }, 'Reuse Entries (' + form.reuses.length + ')'),
                h(RW.Button, { size: 'sm', variant: 'secondary', onClick: addReuseEntry }, '+ Add Reuse Entry')
              ),
              form.reuses.map(function (re, idx) {
                return h('div', { key: re.id || idx, style: { padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--surface)', display: 'grid', gridTemplateColumns: '120px minmax(0, 1.5fr) minmax(0, 1.2fr) 40px', gap: '12px', alignItems: 'center' } },
                  h(RW.TextField, {
                    label: idx === 0 ? 'Volume (L)' : undefined, type: 'number', step: '0.1', unit: 'L',
                    placeholder: '0.0', value: re.vol,
                    onChange: function (e) { updateReuseEntry(idx, 'vol', e.target.value); }
                  }),
                  h(RW.Select, {
                    label: idx === 0 ? 'Non-potable purpose' : undefined,
                    options: [
                      { value: 'Floor cleaning', label: 'Floor cleaning' },
                      { value: 'Garden watering', label: 'Garden watering' },
                      { value: 'Toilet flushing', label: 'Toilet flushing' },
                      { value: 'Pre-rinsing utensils', label: 'Pre-rinsing utensils' },
                      { value: 'Vehicle wash', label: 'Vehicle wash' },
                      { value: 'Cooling / other', label: 'Cooling / other' }
                    ],
                    value: re.use,
                    onChange: function (e) { updateReuseEntry(idx, 'use', e.target.value); }
                  }),
                  h(RW.TextField, {
                    label: idx === 0 ? 'Date & Time' : undefined,
                    placeholder: 'e.g. 28 Oct, 6:40 PM', value: re.date,
                    onChange: function (e) { updateReuseEntry(idx, 'date', e.target.value); }
                  }),
                  h('div', { style: { paddingTop: idx === 0 ? '22px' : '0' } },
                    form.reuses.length > 1 ? h(RW.Button, {
                      variant: 'quiet', size: 'sm', icon: 'close', 'aria-label': 'Remove reuse entry',
                      onClick: function () { removeReuseEntry(idx); }
                    }) : null
                  )
                );
              })
            )
          ) : null,

          // Tab 4: Tank Information (Bidirectional volume <-> fill % sync)
          form.activeTab === 'tank' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            h('div', { style: { fontSize: '13px', color: 'var(--ink-secondary)' } },
              'Enter the tank level. Entering the current volume automatically calculates the fill percentage, and entering the fill percentage calculates the volume.'
            ),
            h('div', { style: grid2 },
              h(RW.TextField, {
                label: 'Current water volume', type: 'number', step: '0.1', unit: 'L',
                placeholder: 'e.g. 14.4', value: form.tankVolume, error: form.errors.tankVolume,
                hint: 'Auto-calculates fill percentage below',
                onChange: function (e) { updateField('tankVolume', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Tank fill percentage', type: 'number', step: '0.1', unit: '%',
                placeholder: 'e.g. 72.0', value: form.tankPct,
                hint: 'Auto-calculates volume above',
                onChange: function (e) { updateField('tankPct', e.target.value); }
              })
            ),
            h('div', { style: grid3 },
              h(RW.TextField, {
                label: 'Total tank capacity', type: 'number', unit: 'L',
                value: form.tankCapacity, error: form.errors.tankCapacity,
                onChange: function (e) { updateField('tankCapacity', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Alert threshold level', type: 'number', unit: '%',
                value: form.tankThreshold,
                hint: 'Alert triggered when level reaches this %',
                onChange: function (e) { updateField('tankThreshold', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Tank ID / Location',
                value: form.tankLocation,
                onChange: function (e) { updateField('tankLocation', e.target.value); }
              })
            ),
            // Mini visual gauge
            h('div', { style: { padding: '16px 20px', background: 'var(--canvas)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px' } },
                h('span', { style: { fontWeight: '500' } }, 'Tank Fill Visualization'),
                h('span', { className: 'mono' }, (liveTankPct != null ? liveTankPct.toFixed(1) : 0) + '% (' + (tVol != null ? tVol.toFixed(1) : 0) + ' L / ' + tCap + ' L)')
              ),
              h('div', { style: { height: '14px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', position: 'relative' } },
                h('div', { style: { height: '100%', width: Math.min(100, Math.max(0, liveTankPct || 0)) + '%', background: (liveTankPct || 0) >= parseFloat(form.tankThreshold) ? 'var(--warning)' : 'var(--aqua)', transition: 'width 0.2s' } })
              ),
              h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--ink-secondary)' } },
                h('span', null, '0 L'),
                h('span', null, 'Threshold: ' + form.tankThreshold + '%'),
                h('span', null, tCap + ' L')
              )
            )
          ) : null,

          // Tab 5: Device & Context
          form.activeTab === 'device' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
            h('div', { style: { fontSize: '13px', color: 'var(--ink-secondary)' } },
              'Select the purifier unit, timestamp and operational conditions for this test.'
            ),
            h('div', { style: grid2 },
              h(RW.Select, {
                label: 'Device / Installation',
                options: devices.map(function (d) { return { value: d.id, label: d.name + ' (' + d.id + ')' }; }),
                value: form.deviceId,
                onChange: function (e) { updateField('deviceId', e.target.value); }
              }),
              h(RW.Select, {
                label: 'Water source condition',
                options: [
                  { value: 'Municipal supply', label: 'Municipal supply' },
                  { value: 'Borewell blend', label: 'Borewell blend' },
                  { value: 'Tanker water', label: 'Tanker water' },
                  { value: 'Post-filter replacement test', label: 'Post-filter replacement test' },
                  { value: 'Post-sanitization run', label: 'Post-sanitization run' }
                ],
                value: form.cond,
                onChange: function (e) { updateField('cond', e.target.value); }
              })
            ),
            h('div', { style: grid2 },
              h(RW.TextField, {
                label: 'Test Date', type: 'date',
                value: form.testDate, error: form.errors.testDate,
                onChange: function (e) { updateField('testDate', e.target.value); }
              }),
              h(RW.TextField, {
                label: 'Test Time', type: 'time',
                value: form.testTime, error: form.errors.testTime,
                onChange: function (e) { updateField('testTime', e.target.value); }
              })
            ),
            h(RW.TextField, {
              label: 'Notes / Observations (Optional)',
              placeholder: 'e.g. Filter cartridge replaced, pump pressure steady at 70 psi.',
              value: form.notes,
              onChange: function (e) { updateField('notes', e.target.value); }
            })
          ) : null
        ),

        // Modal Footer
        h('div', { style: footStyle },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            Object.keys(form.errors).length > 0
              ? h('span', { style: { fontSize: '13px', color: 'var(--danger)', fontWeight: '500' } },
                  'Please fix the ' + Object.keys(form.errors).length + ' error(s) above.'
                )
              : (form.warnings.balance ? h('span', { style: { fontSize: '13px', color: 'var(--warning)', fontWeight: '500' } }, 'Water balance warning noted.') : null)
          ),
          h('div', { style: { display: 'flex', gap: '10px' } },
            h(RW.Button, { onClick: props.onCancel }, 'Cancel'),
            h(RW.Button, { variant: 'secondary', onClick: function () { handleSubmit(true); } }, 'Save as Incomplete'),
            h(RW.Button, { variant: 'primary', onClick: function () { handleSubmit(false); } }, mode === 'edit' ? 'Update Record' : 'Save Record')
          )
        )
      )
    );
  }

  // Register onto window.RejectWise
  if (typeof window !== 'undefined') {
    window.RejectWise = window.RejectWise || {};
    window.RejectWise.RecordModal = RecordModal;
  }

  return RecordModal;
});
