# Appendix Table – SAP Analytics Cloud Custom Widget

## 📌 Overview

Appendix Table is a custom widget for SAP Analytics Cloud (SAC) that displays filters, variables, or any structured metadata in a flexible table format.

Originally designed for showing SAC filters/variables, the widget is now fully dynamic and reusable for any tabular metadata.

---

## 🚀 Features

* ✅ Dynamic columns (not limited)
* ✅ Configurable column headers
* ✅ Optional operator column (`showOperator`)
* ✅ Full styling support (similar to SAC tables)
* ✅ Custom CSS injection
* ✅ Sticky header support
* ✅ Fully data-driven rendering
* ✅ Lightweight (pure Web Component)

---

## 📦 Installation

### 1. Host JavaScript

Upload `appendix-table.js` to a public HTTPS location:

```text
https://<your-domain>/appendix-table.js
```

---

### 2. Import into SAC

1. Go to **Custom Widgets**
2. Click **Upload**
3. Upload `appendix-table.json`
4. Add widget to your Story / Analytics Application

---

## ⚙️ Properties

| Property      | Type   | Description                       |
| ------------- | ------ | --------------------------------- |
| `rows`        | string | JSON array with table rows        |
| `config`      | string | JSON config for default structure |
| `columns`     | string | JSON array for dynamic columns    |
| `styleConfig` | string | JSON styling configuration        |
| `customCss`   | string | Custom CSS                        |

---

## 🧩 Data Structures

### Rows

```json
[
  { "label": "Company Code", "op": "=", "value": "1000" }
]
```

---

### Config

```json
{
  "label": "Filter",
  "op": "Operator",
  "value": "Value",
  "showOperator": true,
  "emptyText": "No data available"
}
```

---

### Dynamic Columns

```json
[
  { "key": "type", "title": "Type" },
  { "key": "name", "title": "Name" },
  { "key": "selection", "title": "Selection" }
]
```

---

### Style Config

```json
{
  "fontSize": "13px",
  "fontFamily": "Arial",
  "headerBackground": "#354a5f",
  "headerColor": "#ffffff",
  "rowBackground": "#ffffff",
  "alternateRowBackground": "#f7f7f7",
  "borderColor": "#d9d9d9",
  "textColor": "#333333",
  "rowHeight": "compact",
  "showGrid": true,
  "stickyHeader": true
}
```

---

## 🧪 Usage in SAC

### Basic Example

```javascript
AppendixTable_1.setRows(
  '[{"label":"Company Code","op":"=","value":"1000"}]'
);
```

---

### With Config

```javascript
AppendixTable_1.setConfig(
  '{"label":"Filter","op":"Operator","value":"Value","showOperator":true}'
);
```

---

### Without Operator Column

```javascript
AppendixTable_1.setConfig(
  '{"label":"Filter","value":"Value","showOperator":false}'
);
```

---

### Dynamic Columns

```javascript
AppendixTable_1.setColumns(
  '[{"key":"type","title":"Type"},{"key":"name","title":"Name"},{"key":"selection","title":"Selection"}]'
);

AppendixTable_1.setRows(
  '[{"type":"Variable","name":"Fiscal Year","selection":"2024"}]'
);
```

---

### Styling

```javascript
AppendixTable_1.setStyleConfig(
  '{"headerBackground":"#354a5f","headerColor":"#fff","rowHeight":"compact"}'
);
```

---

### Custom CSS

```javascript
AppendixTable_1.setCustomCss(
  'td{font-size:14px;} tr:hover{background:#eef5ff;}'
);
```

---

## 🔗 SAC Integration

Custom widgets **cannot directly read SAC filters or variables**.

👉 You must pass data via SAC scripting.

```javascript
var rows =
  '[' +
  '{"label":"Region","op":"IN","value":"EMEA, APJ"}' +
  ']';

AppendixTable_1.setRows(rows);
```

---

## ⚠️ Limitations

* No direct SAC API access inside widget
* Requires JSON string input
* `JSON.stringify` not supported in SAC scripting
* Browser-based → JS cannot be fully protected

---

## 🔐 Security Notes

For commercial use:

* Use controlled hosting (not GitHub Pages)
* Add license validation
* Restrict by SAC tenant

---

## 📈 Roadmap

* Auto-binding to SAC Input Controls
* Export (CSV / PDF)
* Sorting / filtering
* Themes

---

## 👨‍💻 Author

Petr Anderle

---

## 📄 License

Custom / internal (define as needed)
