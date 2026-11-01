# RejectWise prototype · all pages — design reference


## Contents

- `Main.dc.html` — the artboard (a Design Component: an `<x-dc>`
  template + a small logic class). The values to replicate live in its
  inline `style="…"` attributes and the `<helmet><style>` block.
- `BalanceChart.dc.html` — referenced resource
- `ColumnChart.dc.html` — referenced resource
- `ds/rejectwise/components/bundle.css` — referenced resource
- `ds/rejectwise/components/bundle.js` — referenced resource
- `ds/rejectwise/tokens.css` — referenced resource
- `ds/rejectwise/tokens.json` — referenced resource
- `support.js`, `vendor/react*.js` — the runtime that renders the
  component in a browser; not part of the design.

## Viewing

Serve the folder (e.g. `python3 -m http.server`) and open `Main.dc.html`;
some browsers block the scripts over file://.
