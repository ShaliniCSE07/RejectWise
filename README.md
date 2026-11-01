# RejectWise — Water Monitoring & Analytics Application

RejectWise is a human-input-driven and sensor-ready water monitoring and analytics application for reverse osmosis (RO) purifiers. It transitions from static mock prototypes into an interactive system featuring manual test logging, real-time calculations, automated status and alert detection, multi-device management, and persistent local storage.

---

## Quick Start (How to Run)

Because modern web browsers block ES modules, web components, and dynamic script imports over the `file://` protocol, serve the project folder using any local HTTP server:

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 8000
```
Then open your browser at:
[http://localhost:8000](http://localhost:8000) or [http://localhost:8000/Main.dc.html](http://localhost:8000/Main.dc.html)

### Option 2: Node.js `npx serve` or `http-server`
```bash
npx serve .
# or
npx http-server -p 8000
```

---

## Key Features

### 1. Central Data Entry System
- **"+ Add Test Record" button**: Prominently accessible in the top header and on the Test History page.
- **5-Section Tabbed Entry Form**:
  1. **Water Volumes**: Feed volume, purified product volume, reject water generated. Real-time water balance validation.
  2. **Water Quality & Flows**: Input TDS, input turbidity, product TDS, and flow rates (Feed, Purified, Reject). Includes toggles to mark uninstalled or unavailable sensors.
  3. **Reject Reuse**: Multi-row reuse logging (e.g., floor cleaning, garden watering, toilet flushing, utensil pre-rinse) with volume tracking against collected reject.
  4. **Tank Information**: Storage tank volume and fill percentage with bidirectional synchronization (entering volume auto-calculates fill %, and entering fill % auto-calculates volume).
  5. **Device & Context**: Device selection, test date/time, source water condition, and free-form notes.
- **Live Calculations Banner**: Displays test recovery rate, reject fraction, balance difference, and tank fill level in real time before submission.
- **Save as Incomplete**: Allows saving partial test observations with an explicit `Incomplete` status flag.

### 2. Automatic Calculations Engine (`app/calculations.js`)
- **Recovery Rate**: $\text{Recovery (\%)} = \frac{\text{Purified Volume}}{\text{Feed Volume}} \times 100$
- **Reject Fraction**: $\text{Reject Fraction (\%)} = \frac{\text{Reject Volume}}{\text{Feed Volume}} \times 100$
- **Water Balance Difference**: $\text{Balance Difference} = \text{Feed} - \text{Purified} - \text{Reject}$
- **Tank Fill**: $\text{Tank Fill (\%)} = \frac{\text{Current Tank Volume}}{\text{Tank Capacity}} \times 100$
- **Remaining Capacity**: $\text{Remaining Capacity} = \text{Capacity} - \text{Current Volume}$
- **TDS Reduction**: $\text{TDS Reduction (\%)} = \frac{\text{Input TDS} - \text{Product TDS}}{\text{Input TDS}} \times 100$

### 3. Automated Test Status & Alert Engine (`app/alerts.js`)
- **Status Classification**:
  - `Within baseline`: Normal operation with recovery inside the device's configured baseline range.
  - `Incomplete`: Critical measurements missing.
  - `Change detected`: Recovery outside baseline or significant water quality anomaly detected.
- **Automated Alerts**:
  - Tank level reaching or exceeding alert threshold.
  - Recovery falling below or exceeding configured baseline limits.
  - Water balance discrepancy warnings.
- **Alert Lifecycle**: Active, Acknowledged, and Resolved states with deduplication and full history preservation.

### 4. Device Management (`app/deviceModal.js`)
- Support for multiple purifier installations (e.g., `unit-01`, `unit-02`, cafeteria, lab bench).
- Each device maintains its own isolated records, tank configuration, baseline recovery range, alert thresholds, and alert history.
- Easy switching via the top navigation dropdown or adding new devices via "+ Device".

### 5. Date & Reporting Period Management
- Flexible periods: Last 24 Hours, Last 7 Days, Last 30 Days, or Custom Date Range.
- Search and filter records in Test History by keyword, status (`Within baseline`, `Change detected`, `Incomplete`), and timeframe.

### 6. Persistence & Data Source Provenance (`app/storage.js`)
- Persistent `localStorage` storage layer with in-memory fallback.
- Clear data source badging on every record: **Manual Entry**, **ESP32 Sensor**, or **Demo Data**.
- Options in Settings to restore demo dataset or clear test data.

---

## Project Structure

```
RejectWise prototype/
├── app/
│   ├── models.js          # Core data models, factory functions & ID generators
│   ├── calculations.js    # Pure calculations (recovery, balance, aggregation, periods)
│   ├── validation.js      # Input validation & boundary checks
│   ├── alerts.js          # Alert evaluation, deduplication & lifecycle
│   ├── storage.js         # LocalStorage persistence & demo data seeding
│   ├── recordModal.js     # React modal for Adding/Editing test records
│   └── deviceModal.js     # React modal for Adding/Editing purifier units
├── ds/                    # RejectWise Design System (tokens & bundled components)
├── tests/
│   ├── test_logic.js      # Unit tests for calculations, validation, and storage
│   ├── check_syntax.js    # Component script syntax verification
│   ├── simulate_app.js    # End-to-end multi-page simulation test
│   └── test_modals.js     # React modal structure & interaction tests
├── Main.dc.html           # Main application template and reactive controller
├── BalanceChart.dc.html   # Water balance and recovery chart component
├── ColumnChart.dc.html    # Volume breakdown column chart component
├── support.js             # Design Component runtime
└── index.html             # Convenient root redirect to Main.dc.html
```

---

## Running Automated Tests

Run the test suite using Node.js:

```bash
# Unit tests (calculations, validation, storage)
node tests/test_logic.js

# Component syntax verification
node tests/check_syntax.js

# Modal structure and pre-fill tests
node tests/test_modals.js

# End-to-end application lifecycle simulation
node tests/simulate_app.js
```
