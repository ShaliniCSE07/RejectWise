/* @ds-bundle: {"format": 4, "namespace": "RejectWise", "components": [{"name": "Icon"}, {"name": "Button"}, {"name": "StatusChip"}, {"name": "DataLabel"}, {"name": "ConnectionStatus"}, {"name": "MetricCard"}, {"name": "SensorTile"}, {"name": "TankLevel"}, {"name": "ChartPanel"}, {"name": "DataTable"}, {"name": "AlertRow"}, {"name": "InlineAlert"}, {"name": "Toast"}, {"name": "StateMessage"}, {"name": "ConfirmDialog"}, {"name": "Sidebar"}, {"name": "NavItem"}, {"name": "TopBar"}, {"name": "Tabs"}, {"name": "Select"}, {"name": "TextField"}, {"name": "Tooltip"}, {"name": "InfoTip"}]} */
(function () {
  var React = window.React, h = React.createElement, F = React.Fragment;
  var ICONS = {"overview": "<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"4\" width=\"7\" height=\"4\" rx=\"1.5\"/><rect x=\"13\" y=\"10\" width=\"7\" height=\"10\" rx=\"1.5\"/><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/>", "live": "<path d=\"M3 12h4l3-7 4 14 3-7h4\"/>", "quality": "<path d=\"M9 3h6\"/><path d=\"M10 3v6.5L5.2 17.6A2.2 2.2 0 0 0 7.1 21h9.8a2.2 2.2 0 0 0 1.9-3.4L14 9.5V3\"/><path d=\"M7.4 15h9.2\"/>", "recovery": "<path d=\"M19.5 13a7.5 7.5 0 0 1-13.1 4.4\"/><path d=\"M4.5 11a7.5 7.5 0 0 1 13.1-4.4\"/><path d=\"M18 3v4h-4\"/><path d=\"M6 21v-4h4\"/>", "trends": "<path d=\"M3 17l6-6 4 4 8-8\"/><path d=\"M15 7h6v6\"/>", "history": "<path d=\"M3.5 12a8.5 8.5 0 1 0 2.6-6.1\"/><path d=\"M3.5 4v4.5H8\"/><path d=\"M12 7.5V12l3 2\"/>", "alerts": "<path d=\"M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z\"/><path d=\"M10 21h4\"/>", "reports": "<path d=\"M6 3h8l4 4v14H6z\"/><path d=\"M14 3v4h4\"/><path d=\"M9 12h6\"/><path d=\"M9 16h6\"/>", "settings": "<path d=\"M4 7h9\"/><path d=\"M17 7h3\"/><circle cx=\"15\" cy=\"7\" r=\"2\"/><path d=\"M4 17h3\"/><path d=\"M11 17h9\"/><circle cx=\"9\" cy=\"17\" r=\"2\"/>", "device": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5\"/>", "connected": "<path d=\"M4.5 10a11 11 0 0 1 15 0\"/><path d=\"M7.5 13.5a6.5 6.5 0 0 1 9 0\"/><path d=\"M12 18h.01\"/>", "disconnected": "<path d=\"M4.5 10a11 11 0 0 1 15 0\"/><path d=\"M7.5 13.5a6.5 6.5 0 0 1 9 0\"/><path d=\"M12 18h.01\"/><path d=\"M3 3l18 18\"/>", "tank": "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M5 12h14\"/><path d=\"M9 16h6\"/>", "flow": "<path d=\"M3 8h13\"/><path d=\"M13 5l3 3-3 3\"/><path d=\"M21 16H8\"/><path d=\"M11 13l-3 3 3 3\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5\"/><path d=\"M12 8h.01\"/>", "check": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 12.5l2.7 2.7L16 9.5\"/>", "warning": "<path d=\"M10.3 4.2a2 2 0 0 1 3.4 0l7.4 12.8A2 2 0 0 1 19.4 20H4.6a2 2 0 0 1-1.7-3z\"/><path d=\"M12 9.5v4\"/><path d=\"M12 16.5h.01\"/>", "critical": "<path d=\"M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z\"/><path d=\"M12 8v5\"/><path d=\"M12 16h.01\"/>", "stale": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>", "download": "<path d=\"M12 4v11\"/><path d=\"M7 10l5 5 5-5\"/><path d=\"M5 20h14\"/>", "calendar": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"2\"/><path d=\"M3.5 10h17\"/><path d=\"M8 3v4M16 3v4\"/>", "chevron-down": "<path d=\"M6 9l6 6 6-6\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4.5 4.5\"/>", "close": "<path d=\"M6 6l12 12\"/><path d=\"M18 6L6 18\"/>", "help": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.3-1.2.9-1.2 1.6v.4\"/><path d=\"M12 17h.01\"/>", "menu": "<path d=\"M4 7h16\"/><path d=\"M4 12h16\"/><path d=\"M4 17h10\"/>", "refresh": "<path d=\"M20 11a8 8 0 0 0-14.6-4.5\"/><path d=\"M4 4v4h4\"/><path d=\"M4 13a8 8 0 0 0 14.6 4.5\"/><path d=\"M20 20v-4h-4\"/>"};
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }
  function show(v) { return v === null || v === undefined || v === '' ? '—' : v; }
  function dl(p) { return p && p['data-label'] !== undefined && p.dataLabel === undefined ? Object.assign({}, p, { dataLabel: p['data-label'] }) : p; }

  function Icon(p) {
    var size = p.size || 18;
    return h('svg', {
      className: cx('rw-icon', p.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: p.strokeWidth || 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
      role: p.label ? 'img' : undefined, 'aria-label': p.label || undefined, 'aria-hidden': p.label ? undefined : 'true', focusable: 'false',
      dangerouslySetInnerHTML: { __html: ICONS[p.name] || ICONS.info }
    });
  }
  Icon.names = Object.keys(ICONS);

  function Tooltip(p) {
    return h('span', { className: cx('rw-tt', p.placement === 'bottom' && 'rw-tt-bottom', p.open && 'rw-tt-open', p.className) },
      p.children, h('span', { role: 'tooltip', className: 'rw-tt-bubble' }, p.content));
  }

  function InfoTip(p) {
    return h(Tooltip, { content: p.content, placement: p.placement },
      h('button', { type: 'button', className: 'rw-info', 'aria-label': p.label || 'About this metric' }, h(Icon, { name: 'info', size: 15 })));
  }

  function Button(p) {
    var variant = p.variant || 'secondary', rest = omit(p, ['variant', 'size', 'icon', 'iconAfter', 'loading', 'className', 'children']);
    var iconOnly = p.icon && !p.children;
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('rw-btn', 'rw-btn-' + variant, p.size === 'sm' && 'rw-btn-sm', iconOnly && 'rw-btn-icon', p.className),
      disabled: p.disabled || p.loading, 'aria-busy': p.loading ? 'true' : undefined
    }),
      p.loading ? h('span', { className: 'rw-spin', 'aria-hidden': 'true' }) : (p.icon ? h(Icon, { name: p.icon, size: p.size === 'sm' ? 16 : 18 }) : null),
      p.children,
      p.iconAfter ? h(Icon, { name: p.iconAfter, size: 16 }) : null);
  }

  var CHIP = { normal: 'check', attention: 'warning', critical: 'critical', offline: 'disconnected', info: 'info' };
  function StatusChip(p) {
    var tone = p.tone || 'normal';
    return h('span', { className: cx('rw-chip', 'rw-chip-' + tone, p.className) }, p.icon === false ? null : h(Icon, { name: p.icon || CHIP[tone], size: 14, strokeWidth: 2 }), p.children);
  }

  var DL = { live: 'Live', recorded: 'Recorded', calculated: 'Calculated', estimated: 'Estimated', demo: 'Demo data' };
  var DLT = { live: 'Newly received sensor data.', recorded: 'Saved test data.', calculated: 'Derived from recorded measurements.', estimated: 'Inferred from a configured calibration or model.', demo: 'Sample values for a prototype demonstration — not a sensor reading.' };
  function DataLabel(p) {
    var kind = p.kind || 'demo';
    return h('span', { className: cx('rw-dl', 'rw-dl-' + kind, p.className), title: DLT[kind] },
      kind === 'live' ? h('span', { className: 'rw-dl-dot', 'aria-hidden': 'true' }) : null, p.children || DL[kind]);
  }

  var CONN = { connected: 'ESP32 connected', demo: 'Demo mode', disconnected: 'Disconnected', stale: 'Reading stale' };
  function ConnectionStatus(p) {
    var s = p.state || 'demo';
    var label = h('span', { className: 'rw-conn-state' }, h('span', { className: 'rw-conn-dot', 'aria-hidden': 'true' }), p.label || CONN[s]);
    if (p.compact) return h('div', { className: cx('rw-conn', 'rw-conn-compact', 'rw-conn-' + s, p.className), role: 'status' }, label);
    return h('div', { className: cx('rw-conn', 'rw-conn-' + s, p.className), role: 'status' },
      label,
      p.lastReading ? h(F, null, h('span', { className: 'rw-conn-sep', 'aria-hidden': 'true' }),
        h('span', { className: 'rw-num' }, (s === 'disconnected' || s === 'stale' ? 'Last successful reading ' : 'Last reading ') + p.lastReading)) : null,
      p.message ? h('span', { className: 'rw-conn-msg' }, p.message) : null,
      s === 'demo' ? h(DataLabel, { kind: 'demo' }) : null,
      p.action || null);
  }

  function MetricCard(p) {
    p = dl(p);
    var t = p.trend;
    return h('div', { className: cx('rw-card', 'rw-metric', p.className) },
      h('div', { className: 'rw-card-head' },
        h('span', { className: 'rw-label' }, p.label, p.info ? h(InfoTip, { content: p.info, label: 'About ' + p.label }) : null),
        p.status || null),
      h('div', { className: 'rw-metric-value' },
        h('span', { className: 'rw-metric-num rw-num' }, show(p.value)),
        p.value !== null && p.value !== undefined && p.unit ? h('span', { className: 'rw-metric-unit' }, p.unit) : null),
      h('div', { className: 'rw-metric-foot' },
        t ? h('span', { className: 'rw-trend rw-num' }, h(Icon, { name: t.direction === 'down' ? 'chevron-down' : 'trends', size: 14 }), t.value) : null,
        t && t.label ? h('span', null, t.label) : null,
        p.context ? h('span', null, p.context) : null,
        p.dataLabel ? h(DataLabel, { kind: p.dataLabel }) : null));
  }

  var SENSOR = { stale: ['attention', 'Stale'], unavailable: ['offline', 'Not configured'], 'out-of-range': ['critical', 'Out of range'], disconnected: ['offline', 'Disconnected'] };
  function SensorTile(p) {
    p = dl(p);
    var s = p.state || 'ok', chip = SENSOR[s];
    var unavailable = s === 'unavailable';
    return h('div', { className: cx('rw-card', 'rw-sensor', 'rw-sensor-' + s, p.className) },
      h('span', { className: 'rw-label' }, p.icon ? h(Icon, { name: p.icon, size: 16 }) : null, p.label),
      h('div', { className: 'rw-sensor-val' },
        unavailable ? h('span', { className: 'rw-sensor-num' }, p.unavailableText || 'Sensor not installed')
          : h(F, null, h('span', { className: 'rw-sensor-num rw-num' }, show(p.value)), p.value !== null && p.value !== undefined ? h('span', { className: 'rw-sensor-unit' }, p.unit) : null)),
      h('div', { className: 'rw-sensor-meta' },
        chip ? h(StatusChip, { tone: chip[0] }, chip[1]) : null,
        p.dataLabel && !unavailable ? h(DataLabel, { kind: p.dataLabel }) : null,
        p.timestamp && !unavailable ? h('span', { className: 'rw-num' }, (s === 'stale' || s === 'disconnected' ? 'Last reading ' : '') + p.timestamp) : null),
      p.note ? h('div', { className: 'rw-sensor-note' }, p.note) : null);
  }

  function TankLevel(p) {
    p = dl(p);
    var r1 = function (v) { return Math.round(v * 10) / 10; };
    var pct = p.percent, has = pct !== null && pct !== undefined, clamped = has ? Math.max(0, Math.min(100, pct)) : 0;
    var cap = p.capacity > 0 ? Number(p.capacity) : null, thr = p.threshold > 0 ? Number(p.threshold) : null;
    var current = has && cap ? r1(cap * clamped / 100) : null;
    var remaining = current !== null ? r1(cap - current) : null;
    var thrL = thr && cap ? r1(cap * thr / 100) : null;
    var fmt = function (v) { return v === null ? '\u2014' : v.toFixed(1) + ' L'; };
    var row = function (k, v, sub) { return h('div', { className: 'rw-tank-row' }, h('span', null, k, sub ? h('span', { className: 'rw-tank-sub' }, sub) : null), h('b', { className: 'rw-num' }, v)); };
    return h('div', { className: cx('rw-tank', p.className) },
      h('div', { className: 'rw-tank-vessel', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': has ? clamped : undefined, 'aria-label': 'Collection tank fill level' },
        has ? h('div', { className: 'rw-tank-fill', style: { height: clamped + '%' } }) : null,
        [25, 50, 75].map(function (t) { return h('span', { key: t, className: 'rw-tank-tick', style: { bottom: t + '%' } }); }),
        thr ? h('span', { className: 'rw-tank-thr', style: { bottom: Math.min(thr, 100) + '%' }, title: 'Configured alert threshold ' + thr + '%' }) : null),
      h('div', { className: 'rw-tank-head' },
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }, p.status || null, p.dataLabel ? h(DataLabel, { kind: p.dataLabel }) : null),
        h('span', { className: 'rw-tank-pct rw-num' }, has ? clamped + '%' : '\u2014'),
        h('span', { className: 'rw-tank-cap' }, has ? 'Fill level, measured' : 'No level reading')),
      h('div', { className: 'rw-tank-info' },
        cap ? row('Current volume', fmt(current), 'estimated') : row('Current volume', 'Capacity not configured'),
        cap ? row('Remaining capacity', fmt(remaining)) : null,
        cap ? row('Total capacity', cap.toFixed(cap % 1 ? 1 : 0) + ' L') : null,
        thr ? row('Alert threshold', thr + '%' + (thrL !== null ? ' \u00b7 ' + thrL.toFixed(1) + ' L' : '')) : null,
        p.timestamp ? row('Updated', p.timestamp) : null,
        cap && has ? h('span', { className: 'rw-tank-note' }, 'Litres are estimated from the measured level and the configured capacity.') : null));
  }

  var SERIES = { feed: 'var(--series-feed)', purified: 'var(--series-purified)', reject: 'var(--series-reject)' };
  function ChartPanel(p) {
    p = dl(p);
    var st = p.state || 'ready', body;
    if (st === 'loading') body = h(StateMessage, { kind: 'loading' });
    else if (st === 'empty') body = h(StateMessage, { kind: 'empty', title: p.emptyTitle || 'Not enough data yet', action: p.emptyAction }, p.emptyText || 'This chart appears once at least two readings exist for the selected period.');
    else if (st === 'error') body = h(StateMessage, { kind: 'error', title: 'Chart could not load', action: p.errorAction }, p.errorText || 'The readings for this period could not be retrieved.');
    else body = p.children;
    return h('section', { className: cx('rw-panel', p.className), 'aria-label': p.title },
      h('div', { className: 'rw-panel-head' },
        h('div', null, h('h3', { className: 'rw-panel-title' }, p.title),
          h('div', { className: 'rw-panel-sub' }, p.period ? h('span', null, p.period) : null, p.dataLabel ? h(DataLabel, { kind: p.dataLabel }) : null)),
        p.actions || null),
      p.legend && st === 'ready' ? h('ul', { className: 'rw-legend', 'aria-label': 'Legend' }, p.legend.map(function (l) {
        return h('li', { key: l.label }, h('span', { className: 'rw-swatch', style: { background: SERIES[l.series] || l.color } }), l.label);
      })) : null,
      h('div', { className: 'rw-panel-body' }, body),
      p.summary ? h('p', { className: 'rw-sr' }, p.summary) : null);
  }

  function DataTable(p) {
    var cols = p.columns || [], rows = p.rows || [], st = p.state || (rows.length ? 'ready' : 'empty');
    var state = st === 'loading' ? h(StateMessage, { kind: 'loading' })
      : st === 'error' ? h(StateMessage, { kind: 'error', title: p.errorTitle || 'Could not load test runs', action: p.errorAction }, p.errorText)
      : st === 'empty' ? h(StateMessage, { kind: 'empty', title: p.emptyTitle || 'No test runs yet', action: p.emptyAction }, p.emptyText || 'Recorded test runs will appear here.') : null;
    return h('div', { className: cx('rw-table-wrap', p.className) },
      h('table', { className: 'rw-table' },
        p.caption ? h('caption', null, p.caption) : null,
        h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { key: c.key, scope: 'col', className: c.numeric ? 'num' : undefined, style: c.width ? { width: c.width } : undefined }, c.label, c.unit ? ' (' + c.unit + ')' : ''); }))),
        state ? null : h('tbody', null, rows.map(function (r, i) {
          var click = p.onRowClick ? function () { p.onRowClick(r, i); } : undefined;
          return h('tr', { key: r.id || i, className: click ? 'rw-click' : undefined, onClick: click, 'aria-selected': p.selectedId !== undefined ? String(p.selectedId === r.id) : undefined },
            cols.map(function (c, j) {
              var v = r[c.key], missing = v === null || v === undefined || v === '';
              var content = c.render ? c.render(v, r) : show(v);
              if (j === 0 && click && !c.render) content = h('button', { type: 'button', className: 'rw-row-btn', onClick: function (e) { e.stopPropagation(); click(); } }, show(v));
              return h('td', { key: c.key, className: cx(c.numeric && 'num', missing && !c.render && 'missing') }, content);
            }));
        }))),
      state ? h('div', { className: 'rw-table-state' }, state) : null);
  }

  var SEV = { critical: ['critical', 'Critical'], warning: ['warning', 'Warning'], info: ['info', 'Info'] };
  var ACTIVE_TONE = { critical: 'critical', warning: 'attention', info: 'info' };
  function AlertRow(p) {
    var sev = p.severity || 'warning', status = p.status || 'open';
    var chip = status === 'acknowledged' ? h(StatusChip, { tone: 'offline', icon: 'check' }, 'Acknowledged')
      : status === 'resolved' ? h(StatusChip, { tone: 'normal' }, 'Resolved')
      : h(StatusChip, { tone: ACTIVE_TONE[sev] || 'attention' }, 'Active');
    var facts = [['Subsystem', p.subsystem], ['Observed', p.observed], ['Threshold', p.threshold]].filter(function (f) { return f[1]; });
    return h('div', { className: cx('rw-alert', 'rw-alert-' + sev, 'rw-alert-is-' + status, status === 'resolved' && 'rw-alert-resolved', p.className) },
      h('div', { className: 'rw-alert-ico' }, h(Icon, { name: SEV[sev][0], size: 18, label: SEV[sev][1] })),
      h('div', null,
        h('div', { className: 'rw-alert-title' }, p.onOpen ? h('button', { type: 'button', className: 'rw-alert-open', onClick: p.onOpen }, p.title) : p.title, chip),
        facts.length ? h('dl', { className: 'rw-alert-facts' }, facts.map(function (f) { return h('div', { key: f[0] }, h('dt', null, f[0]), h('dd', null, f[1])); })) : null,
        p.nextCheck && status !== 'resolved' ? h('div', { className: 'rw-alert-next' }, 'Next check: ', h('b', null, p.nextCheck)) : null,
        p.note ? h('div', { className: 'rw-alert-note' }, p.note) : null),
      h('div', { className: 'rw-alert-side' },
        h('time', { className: 'rw-alert-time' }, p.time),
        status === 'resolved' ? null : h('div', { className: 'rw-alert-actions' },
          status === 'open' && p.onAcknowledge ? h(Button, { size: 'sm', onClick: p.onAcknowledge }, 'Acknowledge') : null,
          p.onResolve ? h(Button, { size: 'sm', variant: 'quiet', onClick: p.onResolve }, 'Mark resolved') : null)));
  }

  var INL = { info: 'info', success: 'check', warning: 'warning', danger: 'critical' };
  function InlineAlert(p) {
    var tone = p.tone || 'info';
    return h('div', { className: cx('rw-inline', 'rw-inline-' + tone, p.className), role: tone === 'danger' ? 'alert' : 'status' },
      h(Icon, { name: INL[tone], size: 18 }),
      h('div', { className: 'rw-inline-main' }, p.title ? h('div', { className: 'rw-inline-title' }, p.title) : null, p.children ? h('div', { className: 'rw-inline-body' }, p.children) : null),
      p.action || null);
  }

  function Toast(p) {
    var tone = p.tone || 'success';
    return h('div', { className: cx('rw-toast', 'rw-toast-' + tone, p.className), role: 'status' },
      h(Icon, { name: INL[tone] || 'info', size: 18 }), h('span', { className: 'rw-toast-msg' }, p.children),
      p.onClose ? h(Button, { variant: 'quiet', size: 'sm', icon: 'close', 'aria-label': 'Dismiss', onClick: p.onClose }) : null);
  }

  var SM = { empty: 'history', stale: 'stale', unavailable: 'disconnected', error: 'critical' };
  function StateMessage(p) {
    var kind = p.kind || 'empty';
    if (kind === 'loading') return h('div', { className: cx('rw-state', 'rw-state-loading', p.className), 'aria-busy': 'true', 'aria-label': p.title || 'Loading' },
      h('span', { className: 'rw-skel', style: { width: '40%' } }), h('span', { className: 'rw-skel', style: { width: '90%', height: 64 } }), h('span', { className: 'rw-skel', style: { width: '70%' } }));
    return h('div', { className: cx('rw-state', 'rw-state-' + kind, p.className), role: kind === 'error' ? 'alert' : undefined },
      h('div', { className: 'rw-state-ico' }, h(Icon, { name: p.icon || SM[kind], size: 22 })),
      p.title ? h('div', { className: 'rw-state-title' }, p.title) : null,
      p.children ? h('div', { className: 'rw-state-body' }, p.children) : null,
      p.action ? h('div', { className: 'rw-state-action' }, p.action) : null);
  }

  function ConfirmDialog(p) {
    if (!p.open) return null;
    return h('div', { className: 'rw-scrim', onClick: function (e) { if (e.target === e.currentTarget && p.onCancel) p.onCancel(); } },
      h('div', { className: 'rw-dialog', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'rw-dlg-t' },
        h('h2', { id: 'rw-dlg-t' }, p.title),
        p.children ? h('div', { className: 'rw-dialog-body' }, p.children) : null,
        h('div', { className: 'rw-dialog-actions' },
          h(Button, { onClick: p.onCancel }, p.cancelLabel || 'Cancel'),
          h(Button, { variant: p.tone === 'danger' ? 'danger' : 'primary', onClick: p.onConfirm, loading: p.loading }, p.confirmLabel || 'Confirm'))));
  }

  function NavItem(p) {
    return h('button', { type: 'button', className: 'rw-nav-item', 'aria-current': p.active ? 'page' : undefined, onClick: p.onClick, title: p.collapsed ? p.label : undefined, 'aria-label': p.collapsed ? p.label : undefined },
      p.icon ? h(Icon, { name: p.icon, size: 18 }) : null, p.collapsed ? null : p.label,
      p.count && !p.collapsed ? h('span', { className: 'rw-nav-count rw-num', 'aria-label': p.count + ' open' }, p.count) : null);
  }

  var PRIMARY = [['overview', 'Overview', 'overview'], ['live', 'Live monitoring', 'live'], ['quality', 'Water quality', 'quality'], ['recovery', 'Recovery analytics', 'recovery'], ['trends', 'Performance trends', 'trends'], ['history', 'Test history', 'history']];
  var SECONDARY = [['alerts', 'Alerts', 'alerts'], ['reports', 'Reports', 'reports'], ['settings', 'Settings', 'settings']];
  function Sidebar(p) {
    var active = p.active || 'overview', counts = p.counts || {}, col = p.collapsed;
    function list(items) { return h('ul', { className: 'rw-nav' }, items.map(function (it) {
      return h('li', { key: it[0] }, h(NavItem, { label: it[1], icon: it[2], active: active === it[0], count: counts[it[0]], collapsed: col, onClick: p.onNavigate ? function () { p.onNavigate(it[0]); } : undefined }));
    })); }
    return h('nav', { className: cx('rw-sidebar', col && 'rw-sidebar-collapsed', p.className), 'aria-label': 'Main' },
      h('div', { className: 'rw-brand' },
        h('span', { className: 'rw-wordmark' }, col ? 'RW' : 'RejectWise'),
        col ? null : h('div', { className: 'rw-device' }, h(Icon, { name: 'device', size: 16 }), h('span', null, p.device || 'RejectWise Unit 01'))),
      list(PRIMARY),
      h('div', null, col ? null : h('div', { className: 'rw-eyebrow rw-nav-label' }, 'More'), list(SECONDARY)),
      h('div', { className: 'rw-sidebar-foot' },
        h(ConnectionStatus, { state: p.connection || 'demo', compact: true, label: col ? ' ' : undefined }),
        col || !(p.helpHref || p.onHelp) ? null : h('a', { href: p.helpHref || '#help', onClick: p.onHelp ? function (e) { e.preventDefault(); p.onHelp(); } : undefined }, h(Icon, { name: 'help', size: 16 }), 'Help & documentation')));
  }

  function TopBar(p) {
    var crumbs = p.breadcrumb || [p.title || 'Overview'];
    return h('header', { className: cx('rw-topbar', p.className) },
      p.onMenu ? h(Button, { variant: 'quiet', icon: 'menu', 'aria-label': 'Open navigation', onClick: p.onMenu, className: 'rw-topbar-menu' }) : null,
      h('ol', { className: 'rw-crumbs', 'aria-label': 'Breadcrumb' }, crumbs.map(function (c, i) { return h('li', { key: i, 'aria-current': i === crumbs.length - 1 ? 'page' : undefined }, c); })),
      h('div', { className: 'rw-topbar-tools' },
        p.children || null,
        p.lastUpdated ? h('span', { className: 'rw-updated' }, 'Last updated ' + p.lastUpdated) : null,
        h('span', { className: 'rw-bell' },
          h(Button, { variant: 'quiet', icon: 'alerts', 'aria-label': p.alertCount ? 'Notifications, ' + p.alertCount + ' open' : 'Notifications', onClick: p.onNotifications }),
          p.alertCount ? h('span', { className: 'rw-bell-dot', 'aria-hidden': 'true' }) : null)));
  }

  function Tabs(p) {
    return h('div', { className: cx('rw-tabs', p.className), role: 'tablist', 'aria-label': p.label },
      (p.items || []).map(function (t) {
        return h('button', { key: t.id, type: 'button', role: 'tab', className: 'rw-tab', 'aria-selected': String(p.value === t.id), onClick: p.onChange ? function () { p.onChange(t.id); } : undefined },
          t.label, t.count !== undefined ? h('span', { className: 'rw-tab-count rw-num' }, t.count) : null);
      }));
  }

  var uid = 0;
  function useId(given) { var r = React.useRef(given); if (!r.current) r.current = 'rw-f' + (++uid); return r.current; }
  function Field(p, control, id) {
    return h('div', { className: cx('rw-field', p.className) },
      p.label ? h('label', { className: 'rw-field-label', htmlFor: id }, p.label) : null,
      control,
      p.error ? h('span', { className: 'rw-field-error', id: id + '-e' }, h(Icon, { name: 'warning', size: 14 }), p.error)
        : p.hint ? h('span', { className: 'rw-field-hint', id: id + '-h' }, p.hint) : null);
  }

  function Select(p) {
    var id = useId(p.id), rest = omit(p, ['label', 'hint', 'error', 'options', 'icon', 'className', 'id', 'style']);
    return Field(p, h('div', { className: cx('rw-control', p.error && 'rw-invalid', p.disabled && 'rw-control-disabled'), style: p.style },
      p.icon ? h('span', { className: 'rw-control-lead' }, h(Icon, { name: p.icon, size: 16 })) : null,
      h('select', Object.assign({ id: id, 'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': p.error ? id + '-e' : p.hint ? id + '-h' : undefined }, rest),
        (p.options || []).map(function (o) { o = typeof o === 'string' ? { value: o, label: o } : o; return h('option', { key: o.value, value: o.value }, o.label); })),
      h(Icon, { name: 'chevron-down', size: 16, className: 'rw-control-chev' })), id);
  }

  function TextField(p) {
    var id = useId(p.id), rest = omit(p, ['label', 'hint', 'error', 'icon', 'unit', 'className', 'id', 'style']);
    return Field(p, h('div', { className: cx('rw-control', p.error && 'rw-invalid', p.disabled && 'rw-control-disabled'), style: p.style },
      p.icon ? h('span', { className: 'rw-control-lead' }, h(Icon, { name: p.icon, size: 16 })) : null,
      h('input', Object.assign({ id: id, 'aria-invalid': p.error ? 'true' : undefined, 'aria-describedby': p.error ? id + '-e' : p.hint ? id + '-h' : undefined }, rest, { className: p.unit || p.type === 'number' ? 'rw-num' : undefined })),
      p.unit ? h('span', { className: 'rw-control-unit' }, p.unit) : null), id);
  }

  var api = { Icon: Icon, Button: Button, StatusChip: StatusChip, DataLabel: DataLabel, ConnectionStatus: ConnectionStatus, MetricCard: MetricCard, SensorTile: SensorTile, TankLevel: TankLevel, ChartPanel: ChartPanel, DataTable: DataTable, AlertRow: AlertRow, InlineAlert: InlineAlert, Toast: Toast, StateMessage: StateMessage, ConfirmDialog: ConfirmDialog, Sidebar: Sidebar, NavItem: NavItem, TopBar: TopBar, Tabs: Tabs, Select: Select, TextField: TextField, Tooltip: Tooltip, InfoTip: InfoTip };
  window.RejectWise = Object.assign(window.RejectWise || {}, api);
})();
