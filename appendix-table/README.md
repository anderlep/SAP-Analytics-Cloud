# Appendix Table – SAP Analytics Cloud Custom Widget

## 📌 Overview

Appendix Table is a custom widget for SAP Analytics Cloud (SAC) that displays filters, variables, input-control selections, totals, or any structured metadata in a flexible table format.

The widget is fully dynamic, configurable, and visually aligned with SAC native table behavior.

---

## 🚀 Features

* ✅ Dynamic columns  
* ✅ Configurable headers  
* ✅ Optional operator column  
* ✅ SAC-like templates (visual parity)  
* ✅ Auto / manual column width  
* ✅ Conditional styling rules  
* ✅ Total row support  
* ✅ Custom CSS support  
* ✅ Sticky header  
* ✅ Lightweight Web Component (no dependencies)  
* ✅ DataSource binding (Helper script)  

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
4. Add **Appendix Table** to your Story / Analytics Application  

---

## ⚙️ Properties

| Property      | Type   | Description                        |
| ------------- | ------ | ---------------------------------- |
| `rows`        | string | JSON array with table rows         |
| `config`      | string | Default header/behavior config     |
| `columns`     | string | Dynamic column definitions         |
| `styleConfig` | string | Styling, templates, totals, layout |
| `customCss`   | string | Custom CSS                         |
| `rules`       | string | Conditional styling rules          |

---

## 🧩 Basic Rows

```json
[
  { "label": "Company Code", "op": "=", "value": "1000" },
  { "label": "Fiscal Year", "op": "=", "value": "2024" }
]
```

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

---

## 🧱 Dynamic Columns

```javascript
AppendixTable_1.setColumns(
  '[' +
  '{"key":"type","title":"Type","width":"20%"},' +
  '{"key":"name","title":"Name","width":"30%"},' +
  '{"key":"selection","title":"Selection","width":"50%"}' +
  ']'
);
```

---

## 🎨 SAC-like Templates

| SAC Template     | `styleConfig.template` | Behavior                                                   |
| ---------------- | ---------------------- | ---------------------------------------------------------- |
| Default          | `default`              | No vertical borders, horizontal separators, column spacing |
| Report-Styling   | `report`               | Clean layout, no grid, spaced columns                      |
| Alternating Rows | `alternating`          | Alternating row background, no borders                     |
| Basic            | `basic`                | Full grid (classic table)                                  |

```javascript
AppendixTable_1.setStyleConfig('{"template":"default"}');
```

---

## 📏 Column Width

| Mode     | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| `auto`   | Uses browser layout (`table-layout: auto`)                           |
| `manual` | Uses fixed layout (`table-layout: fixed`) and respects column widths |

```javascript
AppendixTable_1.setStyleConfig(
  '{"columnWidthMode":"manual"}'
);
```

---

## 🎛️ Style Config

```json
{
  "template": "default",
  "columnWidthMode": "auto",
  "rowHeight": "default",
  "showGrid": false,
  "stickyHeader": true,
  "columnGap": "12px",
  "showTotal": false,
  "headerLineColor": "#354a5f",
  "headerLineWidth": "1px",
  "rowLineColor": "#d0d0d0",
  "rowLineWidth": "1px",
  "totalLineColor": "#354a5f",
  "totalLineWidth": "1px"
}
```

---

## 🎯 Styling Behavior

* Default and Report templates do NOT use grid borders  
* Only horizontal row separators are rendered  
* Header line is stronger (SAC-like)  
* Column spacing replaces vertical borders  
* Alternating uses row background instead of borders  
* Basic uses full grid  

---

## 🧮 Total Row

```javascript
AppendixTable_1.setStyleConfig(
  '{"showTotal":true,"totalLabel":"Total"}'
);
```

```javascript
AppendixTable_1.setColumns(
  '[' +
  '{"key":"store","title":"Store"},' +
  '{"key":"amount","title":"Value","total":"sum","format":"number"}' +
  ']'
);
```

Supported:

* sum  
* count  

---

## 🎯 Styling Rules

```javascript
AppendixTable_1.setRules(
  '[' +
  '{"column":"store","operator":"contains","value":"Market","target":"row","style":{"backgroundColor":"#eef5ff","fontWeight":"600"}}' +
  ']'
);
```

Operators:

* equals  
* notEquals  
* contains  
* startsWith  
* endsWith  
* empty  
* notEmpty  

---

## 🧵 Custom CSS

```javascript
AppendixTable_1.setCustomCss(
  'tbody tr:hover td{background:#eef5ff;}'
);
```

---

## 🔗 SAC Integration

Widget cannot directly read SAC Input Controls.

Use SAC scripting:

```javascript
AppendixTable_1.setRows(
  '[{"label":"Region","op":"IN","value":"EMEA"}]'
);
```

---

## 🔌 DataSource Binding (Recommended)

### Step 1 – Script Object

Create Script Object named:

Helper

---

### Step 2 – Helper Functions

```javascript
function appendixEscape(value: string) : string {

    if (value === undefined) {
        return "";
    }

    var s = value;

    s = s.replace("\\", "\\\\");
    s = s.replace("\"", "\\\"");

    return s;
}
```

```javascript
function appendixBindDataSource(widget: com.company.sac.appendix.table_1, dataSource: DataSource) : void {

    var rs = dataSource.getResultSet();

    if (rs.length === 0) {
        widget.setRows("[]");
        return;
    }

    var keys = ArrayUtils.create(Type.string);
    var keyIndex = 0;

    for (var k in rs[0]) {
        if (k !== "@MeasureDimension") {
            keys[keyIndex] = k;
            keyIndex = keyIndex + 1;
        }
    }

    var columns = "[";

    for (var c = 0; c < keys.length; c++) {
        columns = columns +
            '{"key":"' + keys[c] + '","title":"' + keys[c] + '"},';
    }

    columns = columns +
        '{"key":"value","title":"Value","format":"number","total":"sum"}]';

    var rows = "[";

    for (var r = 0; r < rs.length; r++) {

        rows = rows + "{";

        for (var i = 0; i < keys.length; i++) {

            var dimKey = keys[i];
            var dimCell = rs[r][dimKey];
            var dimValue = "";

            if (dimCell.description !== undefined) {
                dimValue = dimCell.description;
            } else if (dimCell.id !== undefined) {
                dimValue = dimCell.id;
            }

            rows = rows +
                '"' + dimKey + '":"' + Helper.appendixEscape(dimValue) + '",';
        }

        var measureCell = rs[r]["@MeasureDimension"];
        var dataValue = "";

        if (measureCell.formattedValue !== undefined) {
            dataValue = measureCell.formattedValue;
        } else if (measureCell.rawValue !== undefined) {
            dataValue = measureCell.rawValue;
        }

        rows = rows +
            '"value":"' + Helper.appendixEscape(dataValue) + '"';

        rows = rows + "}";

        if (r < rs.length - 1) {
            rows = rows + ",";
        }
    }

    rows = rows + "]";

    widget.setColumns(columns);
    widget.setRows(rows);
}
```

---

## ▶️ Initialization

```javascript
var ds0 = HELPER_TABLE.getDataSource();
Helper.appendixBindDataSource(AppendixTable_1, ds0);
```

---

## 🎨 Styling Example

```javascript
var cfg =
  '{' +
  '"template":"default",' +
  '"rowHeight":"compact",' +
  '"columnGap":"12px",' +
  '"headerColor":"#354a5f",' +
  '"headerLineColor":"#354a5f",' +
  '"headerLineWidth":"1px",' +
  '"rowLineColor":"#d0d0d0",' +
  '"rowLineWidth":"1px",' +
  '"totalLineColor":"#354a5f",' +
  '"totalLineWidth":"1px",' +
  '"showTotal":true,' +
  '"totalLabel":"Total"' +
  '}';

AppendixTable_1.setStyleConfig(cfg);
```

---

## ⚠️ Notes

* Data must be passed as JSON string  
* `JSON.stringify` may not work in SAC scripting  
* Widget JS must be publicly accessible (HTTPS)  
* Version change required when updating JSON  

---

## 📄 Version

1.3.5

---

## 👨‍💻 Author

Petr Anderle