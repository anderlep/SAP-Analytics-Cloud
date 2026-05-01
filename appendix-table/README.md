# Appendix Table – SAP Analytics Cloud Custom Widget

## 📌 Overview

**Appendix Table** is a custom widget for SAP Analytics Cloud (SAC) that displays filters, variables, or any structured metadata in a flexible table format.

Originally designed for showing SAC filters/variables, the widget is now fully dynamic and reusable for any tabular metadata.

---

## 🚀 Features

* ✅ Dynamic columns (not limited to 3)
* ✅ Configurable column headers
* ✅ Optional operator column (`showOperator`)
* ✅ Fully data-driven rendering
* ✅ Safe HTML rendering (escaping)
* ✅ Works with SAC Analytics Designer scripting
* ✅ Lightweight (pure Web Component, no dependencies)

---

## 📦 Installation

### 1. Host the widget JS

Upload `appendix-table.js` to a public HTTPS location (e.g. GitHub Pages):

```
https://<your-domain>/appendix-table.js
```

---

### 2. Import into SAC

1. Go to **Custom Widgets**
2. Click **Upload**
3. Upload `appendix-table.json`

---

## ⚙️ Configuration

### Properties

| Property  | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| `rows`    | string | JSON array with row data                 |
| `config`  | string | JSON object with default column settings |
| `columns` | string | JSON array defining dynamic columns      |

---

## 🧩 Data Structure

### 🔹 Rows

```json
[
  { "label": "Company Code", "op": "=", "value": "1000" }
]
```

---

### 🔹 Config

```json
{
  "label": "Filter",
  "op": "Operator",
  "value": "Value",
  "showOperator": true
}
```

| Field          | Description                     |
| -------------- | ------------------------------- |
| `label`        | Header for filter/variable name |
| `op`           | Header for operator             |
| `value`        | Header for value                |
| `showOperator` | Show/hide operator column       |

---

### 🔹 Columns (Advanced – Dynamic Mode)

```json
[
  { "key": "type", "title": "Type" },
  { "key": "name", "title": "Name" },
  { "key": "operator", "title": "Operator" },
  { "key": "selection", "title": "Selection" }
]
```

| Field                    | Description                 |
| ------------------------ | --------------------------- |
| `key`                    | Property name in row object |
| `title`                  | Column header               |
| `width` *(optional)*     | CSS width                   |
| `className` *(optional)* | CSS class                   |

---

## 🧪 Usage in SAC (Script)

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

### Fully Dynamic Columns

```javascript
AppendixTable_1.setColumns(
  '[{"key":"type","title":"Type"},{"key":"name","title":"Name"},{"key":"selection","title":"Selection"}]'
);

AppendixTable_1.setRows(
  '[{"type":"Variable","name":"Fiscal Year","selection":"2024"}]'
);
```

---

## 🔗 SAC Integration (Important)

Custom widgets **cannot directly read SAC filters or variables**.

👉 You must extract them via SAC scripting and pass them to the widget.

Example pattern:

```javascript
var data =
  '[' +
  '{"label":"Region","op":"IN","value":"EMEA, APJ"}' +
  ']';

AppendixTable_1.setRows(data);
```

---

## 🛠️ Methods

| Method               | Description         |
| -------------------- | ------------------- |
| `setRows(string)`    | Set table data      |
| `setConfig(string)`  | Set config          |
| `setColumns(string)` | Set dynamic columns |
| `clear()`            | Clear table         |

---

## ⚠️ Limitations

* Runs in browser → no full security for JS
* SAC scripting engine does not support `JSON.stringify`
* Data must be passed as **stringified JSON**

---

## 🔐 Security Notes

* Widget JS must be publicly accessible
* For commercial use:

  * use custom hosting
  * add license validation endpoint
  * optionally restrict by SAC tenant

---

## 📈 Roadmap Ideas

* Auto-binding to SAC Input Controls
* Export to CSV / PDF
* Sorting & filtering
* Theming support

---

## 👨‍💻 Author

Petr Anderle

---

## 📄 License

Internal / custom (define as needed)
