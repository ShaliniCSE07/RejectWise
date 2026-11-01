/**
 * RejectWise - Device Management Modal
 * Allows adding new purifier units or updating existing purifier configurations.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.RejectWiseApp = root.RejectWiseApp || {};
    root.RejectWiseApp.deviceModal = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var React = window.React || (typeof require !== 'undefined' ? require('react') : null);
  var h = React ? React.createElement : null;

  function DeviceModal(props) {
    if (!props.open) return null;

    var RW = window.RejectWise || {};
    var initial = props.initialDevice || {};

    var stateHook = React.useState(function () {
      return {
        id: initial.id || ('unit-0' + (Math.floor(Math.random() * 80) + 3)),
        name: initial.name || 'RejectWise Unit',
        location: initial.location || '',
        capacity: initial.capacity || '20',
        threshold: initial.threshold || '90',
        baseLo: initial.baseLo || '60.5',
        baseHi: initial.baseHi || '63.0',
        freshness: initial.freshness || '30',
        errors: {}
      };
    });

    var form = stateHook[0];
    var setForm = stateHook[1];

    function updateField(k, v) {
      setForm(function (prev) {
        var n = Object.assign({}, prev);
        n[k] = v;
        return n;
      });
    }

    function handleSave() {
      var err = {};
      if (!String(form.name).trim()) err.name = 'Device name is required.';
      if (!String(form.id).trim()) err.id = 'Device ID is required.';
      var cap = parseFloat(form.capacity);
      if (isNaN(cap) || cap <= 0) err.capacity = 'Capacity must be greater than 0 L.';
      var thr = parseFloat(form.threshold);
      if (isNaN(thr) || thr < 1 || thr > 100) err.threshold = 'Threshold must be between 1 and 100%.';

      if (Object.keys(err).length > 0) {
        setForm(function (prev) { return Object.assign({}, prev, { errors: err }); });
        return;
      }

      if (props.onSave) {
        props.onSave({
          id: form.id.trim(),
          name: form.name.trim(),
          location: form.location.trim(),
          capacity: form.capacity,
          threshold: form.threshold,
          baseLo: form.baseLo,
          baseHi: form.baseHi,
          freshness: form.freshness
        });
      }
    }

    var scrimStyle = {
      position: 'fixed', inset: 0, background: 'rgba(16, 56, 45, 0.45)', zIndex: 85,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box'
    };
    var modalStyle = {
      background: 'var(--surface)', borderRadius: '12px', width: '100%', maxWidth: '540px',
      boxShadow: 'var(--shadow-popover)', border: '1px solid var(--border)', overflow: 'hidden'
    };
    var headStyle = {
      padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-raised)'
    };
    var bodyStyle = {
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px'
    };
    var footStyle = {
      padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex',
      alignItems: 'center', justifyContent: 'flex-end', gap: '10px', background: 'var(--surface-raised)'
    };

    return h('div', { style: scrimStyle, onClick: function (e) { if (e.target === e.currentTarget && props.onCancel) props.onCancel(); } },
      h('div', { style: modalStyle, role: 'dialog', 'aria-modal': 'true' },
        h('div', { style: headStyle },
          h('h2', { style: { margin: 0, fontSize: '18px', fontWeight: '600' } }, props.isEdit ? 'Edit Purifier Unit' : 'Add Purifier Device'),
          h(RW.Button, { variant: 'quiet', size: 'sm', icon: 'close', onClick: props.onCancel })
        ),
        h('div', { style: bodyStyle },
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' } },
            h(RW.TextField, {
              label: 'Device ID', value: form.id, error: form.errors.id, disabled: props.isEdit,
              onChange: function (e) { updateField('id', e.target.value); }
            }),
            h(RW.TextField, {
              label: 'Device Name', value: form.name, error: form.errors.name,
              onChange: function (e) { updateField('name', e.target.value); }
            })
          ),
          h(RW.TextField, {
            label: 'Location / Department', placeholder: 'e.g. 2nd Floor Cafeteria or Lab Bench B',
            value: form.location,
            onChange: function (e) { updateField('location', e.target.value); }
          }),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            h(RW.TextField, {
              label: 'Collection Tank Capacity', type: 'number', unit: 'L',
              value: form.capacity, error: form.errors.capacity,
              onChange: function (e) { updateField('capacity', e.target.value); }
            }),
            h(RW.TextField, {
              label: 'Tank Alert Threshold', type: 'number', unit: '%',
              value: form.threshold, error: form.errors.threshold,
              onChange: function (e) { updateField('threshold', e.target.value); }
            })
          ),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            h(RW.TextField, {
              label: 'Baseline Recovery Low', type: 'number', unit: '%',
              value: form.baseLo,
              onChange: function (e) { updateField('baseLo', e.target.value); }
            }),
            h(RW.TextField, {
              label: 'Baseline Recovery High', type: 'number', unit: '%',
              value: form.baseHi,
              onChange: function (e) { updateField('baseHi', e.target.value); }
            })
          )
        ),
        h('div', { style: footStyle },
          h(RW.Button, { onClick: props.onCancel }, 'Cancel'),
          h(RW.Button, { variant: 'primary', onClick: handleSave }, props.isEdit ? 'Save Changes' : 'Add Device')
        )
      )
    );
  }

  if (typeof window !== 'undefined') {
    window.RejectWise = window.RejectWise || {};
    window.RejectWise.DeviceModal = DeviceModal;
  }

  return DeviceModal;
});
