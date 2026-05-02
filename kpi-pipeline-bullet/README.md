# KPI Pipeline Bullet v1.8.2

Script-driven SAC custom widget.

This version removes the need for widget `dataBindings`. Use one technical SAC widget
(Table/Chart) to load the model once, call `getResultSet()` in a script, transform the
result set to a small JSON string, and pass it to the KPI Pipeline Bullet widget.

## Existing API kept

```javascript
KpiPipelineBullet_1.setData(15200, 13000);
KpiPipelineBullet_1.setConfig(cfg2);
KpiPipelineBullet_1.setZones(20, 60, 20);
KpiPipelineBullet_1.setColors("#E74C3C", "#2ECC71", "#F1C40F", "#2F3C7E");
KpiPipelineBullet_1.setVarianceDisplayMode("both");
```

## New script-driven API

```javascript
KpiPipelineBullet_1.setItems(itemsJson);
KpiPipelineBullet_1.setRows(itemsJson); // alias for setItems
KpiPipelineBullet_1.setDataJson(dataJson);
KpiPipelineBullet_1.setResultSet(resultSetJson, mappingJson);
KpiPipelineBullet_1.clearItems();
KpiPipelineBullet_1.addItem("CZ", "Česko", 15200, 13000);
KpiPipelineBullet_1.renderItems();
```

## Config for dimension breakdown

Keep this in `cfg2`:

```javascript
// ==============================
// DIMENSION BREAKDOWN
// ==============================
  '"dimensionBreakdownEnabled":true,' +
  '"maxBreakdownItems":50,' +
  '"breakdownItemHeight":78,' +
  '"breakdownItemGap":8,' +
  '"showDimensionLabel":true,' +
  '"dimensionLabelPosition":"top"' +
```

If another config property follows `dimensionLabelPosition`, add a comma after `"top"`.

## Recommended SAC scripting pattern

This follows the same idea as Appendix Table: manually build a JSON string in SAC
scripting and pass it into the widget. No `JSON.stringify()` is needed.

```javascript
// Uses the same escaping helper you already use for Appendix Table:
// Helper.appendixEscape(value)

function kpiBindDataSource(widget: com.company.sac.kpi.pipeline.bullet_1, dataSource: DataSource): void {
    var rs = dataSource.getResultSet();

    if (rs.length === 0) {
        widget.setItems("[]");
        return;
    }

    // First dimension in the result set
    var dimensionKey = "";

    for (var k in rs[0]) {
        if (k !== "@MeasureDimension" && dimensionKey === "") {
            dimensionKey = k;
        }
    }

    if (dimensionKey === "") {
        widget.setItems("[]");
        return;
    }

    // First two measures in the result set order
    var measureIds = ArrayUtils.create(Type.string);
    var measureCount = 0;

    for (var m = 0; m < rs.length; m++) {
        var measureCell = rs[m]["@MeasureDimension"];
        var measureId = "";

        if (measureCell.id !== undefined) {
            measureId = measureCell.id;
        } else if (measureCell.description !== undefined) {
            measureId = measureCell.description;
        }

        var exists = false;

        for (var mi = 0; mi < measureCount; mi++) {
            if (measureIds[mi] === measureId) {
                exists = true;
            }
        }

        if (exists === false && measureId !== "" && measureCount < 2) {
            measureIds[measureCount] = measureId;
            measureCount = measureCount + 1;
        }
    }

    if (measureCount < 2) {
        widget.setItems("[]");
        return;
    }

    var itemIds = ArrayUtils.create(Type.string);
    var itemLabels = ArrayUtils.create(Type.string);
    var actualValues = ArrayUtils.create(Type.string);
    var referenceValues = ArrayUtils.create(Type.string);
    var itemCount = 0;

    for (var r = 0; r < rs.length; r++) {
        var dimCell = rs[r][dimensionKey];
        var dimId = "";
        var dimLabel = "";

        if (dimCell.id !== undefined) {
            dimId = dimCell.id;
        } else if (dimCell.description !== undefined) {
            dimId = dimCell.description;
        }

        if (dimCell.description !== undefined) {
            dimLabel = dimCell.description;
        } else {
            dimLabel = dimId;
        }

        var itemIndex = -1;

        for (var ii = 0; ii < itemCount; ii++) {
            if (itemIds[ii] === dimId) {
                itemIndex = ii;
            }
        }

        if (itemIndex === -1) {
            itemIndex = itemCount;
            itemIds[itemIndex] = dimId;
            itemLabels[itemIndex] = dimLabel;
            actualValues[itemIndex] = "";
            referenceValues[itemIndex] = "";
            itemCount = itemCount + 1;
        }

        var cell = rs[r]["@MeasureDimension"];
        var cellMeasureId = "";

        if (cell.id !== undefined) {
            cellMeasureId = cell.id;
        } else if (cell.description !== undefined) {
            cellMeasureId = cell.description;
        }

        var raw = "";

        if (cell.rawValue !== undefined) {
            raw = cell.rawValue;
        } else if (cell.formattedValue !== undefined) {
            raw = cell.formattedValue;
        }

        if (cellMeasureId === measureIds[0]) {
            actualValues[itemIndex] = raw;
        }

        if (cellMeasureId === measureIds[1]) {
            referenceValues[itemIndex] = raw;
        }
    }

    var items = "[";

    var added = 0;

    for (var x = 0; x < itemCount; x++) {
        if (actualValues[x] !== "" && referenceValues[x] !== "") {
            if (added > 0) {
                items = items + ",";
            }

            items = items +
                '{"id":"' + Helper.appendixEscape(itemIds[x]) + '",' +
                '"label":"' + Helper.appendixEscape(itemLabels[x]) + '",' +
                '"actualValue":' + actualValues[x] + ',' +
                '"referenceValue":' + referenceValues[x] + '}';

            added = added + 1;
        }
    }

    items = items + "]";

    widget.setItems(items);
}
```

Usage:

```javascript
KpiPipelineBullet_1.setConfig(cfg2);
kpiBindDataSource(KpiPipelineBullet_1, Table_Data.getDataSource());
```

## Manual item JSON

```javascript
var items =
  '[' +
  '{"id":"CZ","label":"Česko","actualValue":15200,"referenceValue":13000},' +
  '{"id":"SK","label":"Slovensko","actualValue":9800,"referenceValue":10500}' +
  ']';

KpiPipelineBullet_1.setConfig(cfg2);
KpiPipelineBullet_1.setItems(items);
```
