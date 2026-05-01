# Appendix Table – SAP Analytics Cloud Custom Widget

## 📌 Overview

Appendix Table is a custom widget for SAP Analytics Cloud (SAC) that displays filters, variables, input-control selections, totals, or any structured metadata in a flexible table format.

The widget is fully dynamic, configurable, and supports SAC-like table styling.

---

## 🚀 Features

* ✅ Dynamic columns
* ✅ Configurable headers
* ✅ Optional operator column
* ✅ SAC-like templates
* ✅ Auto / manual column width
* ✅ Styling rules
* ✅ Total row support
* ✅ Custom CSS support
* ✅ Sticky header
* ✅ Lightweight Web Component

---

## 📦 Installation

### 1. Host JavaScript

Upload `appendix-table.js` to a public HTTPS location:

```text
https://<your-domain>/appendix-table.js
```

### 2. Import into SAC

1. Go to **Custom Widgets**
2. Click **Upload**
3. Upload `appendix-table.json`
4. Add **Appendix Table** to your Story / Analytics Application

---

## ⚙️ Properties

| Property      | Type   | Description                              |
| ------------- | ------ | ---------------------------------------- |
| `rows`        | string | JSON array with table rows               |
| `config`      | string | Default header/behavior config           |
| `columns`     | string | Dynamic column definitions               |
| `styleConfig` | string | Styling, templates, totals, column width |
| `customCss`   | string | Custom CSS                               |
| `rules`       | string | Conditional styling rules                |

---

## 🧩 Basic Rows

```json
[
  { "label": "Company Code", "op": "=", "value": "1000" },
  { "label": "Fiscal Year", "op": "=", "value": "2024" }
]
```

SAC script:

```javascript
AppendixTable_1.setRows(
  '[' +
  '{"label":"Company Code","op":"=","value":"1000"},' +
  '{"label":"Fiscal Year","op":"=","value":"2024"}' +
  ']'
);
```

---

## ⚙️ Config

```json
{
  "label": "Filter",
  "op": "Operator",
  "value": "Value",
  "showOperator": true,
  "emptyText": "No data available"
}
```

Hide operator column:

```javascript
AppendixTable_1.setConfig(
  '{"label":"Filter","value":"Value","showOperator":false}'
);
```

---

## 🧱 Dynamic Columns

```json
[
  { "key": "type", "title": "Type", "width": "20%" },
  { "key": "name", "title": "Name", "width": "30%" },
  { "key": "selection", "title": "Selection", "width": "50%" }
]
```

SAC script:

```javascript
AppendixTable_1.setColumns(
  '[' +
  '{"key":"type","title":"Type","width":"20%"},' +
  '{"key":"name","title":"Name","width":"30%"},' +
  '{"key":"selection","title":"Selection","width":"50%"}' +
  ']'
);

AppendixTable_1.setRows(
  '[' +
  '{"type":"Variable","name":"Fiscal Year","selection":"2024"},' +
  '{"type":"Input Control","name":"Region","selection":"EMEA, APJ"}' +
  ']'
);
```

---

## 🎨 SAC-like Templates

Supported templates:

| SAC Template     | `styleConfig.template` |
| ---------------- | ---------------------- |
| Default          | `default`              |
| Report-Styling   | `report`               |
| Alternating Rows | `alternating`          |
| Basic            | `basic`                |

Example:

```javascript
AppendixTable_1.setStyleConfig(
  '{"template":"report"}'
);
```

---

## 📏 Column Width

Supported modes:

| Mode     | Description                  |
| -------- | ---------------------------- |
| `auto`   | Browser auto-resizes columns |
| `manual` | Uses `columns[].width`       |

Example:

```javascript
AppendixTable_1.setStyleConfig(
  '{"template":"default","columnWidthMode":"manual"}'
);
```

---

## 🎛️ Style Config

```json
{
  "template": "default",
  "columnWidthMode": "auto",
  "fontSize": "12px",
  "fontFamily": "Arial, Helvetica, sans-serif",
  "rowHeight": "default",
  "showGrid": true,
  "stickyHeader": true,
  "showTotal": false
}
```

Useful fields:

| Field             | Values                                      |
| ----------------- | ------------------------------------------- |
| `template`        | `default`, `report`, `alternating`, `basic` |
| `columnWidthMode` | `auto`, `manual`                            |
| `rowHeight`       | `compact`, `default`, `comfortable`         |
| `showGrid`        | `true`, `false`                             |
| `stickyHeader`    | `true`, `false`                             |
| `showTotal`       | `true`, `false`                             |

---

## 🧮 Total Row

Enable total:

```javascript
AppendixTable_1.setStyleConfig(
  '{"template":"report","showTotal":true,"totalLabel":"Total"}'
);
```

Column definition with total:

```javascript
AppendixTable_1.setColumns(
  '[' +
  '{"key":"store","title":"Store"},' +
  '{"key":"amount","title":"Value","total":"sum","format":"number"}' +
  ']'
);

AppendixTable_1.setRows(
  '[' +
  '{"store":"Second Hand","amount":"7770270.07"},' +
  '{"store":"Ozzy","amount":"6957157.78"},' +
  '{"store":"Park Market","amount":"7739920.39"}' +
  ']'
);
```

Supported totals:

| Total   | Description         |
| ------- | ------------------- |
| `sum`   | Sums numeric values |
| `count` | Counts rows         |

---

## 🎯 Styling Rules

Rules allow conditional formatting.

```json
[
  {
    "column": "store",
    "operator": "contains",
    "value": "Market",
    "target": "row",
    "style": {
      "backgroundColor": "#eef5ff",
      "fontWeight": "600"
    }
  }
]
```

SAC script:

```javascript
AppendixTable_1.setRules(
  '[' +
  '{"column":"store","operator":"contains","value":"Market","target":"row","style":{"backgroundColor":"#eef5ff","fontWeight":"600"}}' +
  ']'
);
```

Supported operators:

| Operator     | Description      |
| ------------ | ---------------- |
| `equals`     | Exact match      |
| `notEquals`  | Not equal        |
| `contains`   | Contains text    |
| `startsWith` | Starts with text |
| `endsWith`   | Ends with text   |
| `empty`      | Empty value      |
| `notEmpty`   | Non-empty value  |

Supported rule targets:

| Target | Description               |
| ------ | ------------------------- |
| `cell` | Styles only matching cell |
| `row`  | Styles whole row          |

---

## 🧵 Custom CSS

```javascript
AppendixTable_1.setCustomCss(
  'td.value{font-weight:600;} tbody tr:hover td{background:#eef5ff;}'
);
```

Useful selectors:

```css
.wrapper {}
table {}
thead th {}
tbody td {}
td.operator {}
td.value {}
.total-row td {}
.empty {}
```

---

## 🔗 SAC Integration

The widget cannot directly read SAC Input Controls or model variables by itself.

Use SAC scripting to read values and pass them as JSON strings.

```javascript
var rows =
  '[' +
  '{"type":"Input Control","name":"Region","operator":"IN","selection":"EMEA, APJ"},' +
  '{"type":"Variable","name":"Fiscal Year","operator":"=","selection":"2024"}' +
  ']';

AppendixTable_1.setColumns(
  '[' +
  '{"key":"type","title":"Type"},' +
  '{"key":"name","title":"Name"},' +
  '{"key":"operator","title":"Operator"},' +
  '{"key":"selection","title":"Selection"}' +
  ']'
);

AppendixTable_1.setRows(rows);
```

---

## ⚠️ Notes

* Data must be passed as JSON string
* SAC scripting may not support `JSON.stringify`
* Custom widget JS must be reachable via HTTPS
* `ignoreIntegrity: true` shows a development-mode warning in SAC

---

## 🔐 Security

For commercial use:

* Avoid public GitHub Pages
* Use controlled hosting
* Add license validation
* Restrict by SAC tenant where possible

---

## 📄 Version

`1.3.0`

---

## 👨‍💻 Author

Petr Anderle
