# KPI Pipeline Bullet

**Version:** 1.8.0  
**Vendor:** petr.anderle@mathematix.cz

## What changed in 1.8.0

Version 1.8.0 removes the SAC `dataBindings` approach and adds script-driven data input:

- `setResultSet(resultSetJson, mappingJson)` for data from `getResultSet()`
- `setDataJson(dataJson)` for custom normalized JSON
- optional dimension breakdown rendering
- automatic selection of the first dimension and first two measures when no mapping is provided
- optional in-widget filtering over a shared result set
- original single bullet mode is preserved

No model is loaded by the widget itself. You can load data once in a technical Table/Chart and pass the same result set to multiple widget instances.

## Single bullet mode

```javascript
KpiPipelineBullet_1.setData(15200, 13000);
KpiPipelineBullet_1.setConfig(cfg);
```

## Result set mode

```javascript
var rsJson = JSON.stringify(Table_Data.getDataSource().getResultSet());

KpiPipelineBullet_1.setConfig(cfg);
KpiPipelineBullet_1.setResultSet(rsJson, JSON.stringify({
  dimensionBreakdownEnabled: true,

  // Optional. Empty or omitted = first dimension and first two measures.
  dimensionId: "",
  actualMeasureId: "",
  referenceMeasureId: ""
}));
```

## Two widgets with different filters from the same result set

```javascript
var rsJson = JSON.stringify(Table_Data.getDataSource().getResultSet());

KpiPipelineBullet_1.setConfig(cfg);
KpiPipelineBullet_1.setResultSet(rsJson, JSON.stringify({
  dimensionBreakdownEnabled: true,
  filters: [
    {
      dimensionId: "Region",
      members: ["CZ"]
    }
  ]
}));

KpiPipelineBullet_2.setConfig(cfg);
KpiPipelineBullet_2.setResultSet(rsJson, JSON.stringify({
  dimensionBreakdownEnabled: true,
  filters: [
    {
      dimensionId: "Region",
      members: ["SK"]
    }
  ]
}));
```

## Custom JSON mode

```javascript
KpiPipelineBullet_1.setConfig(cfg);
KpiPipelineBullet_1.setDataJson(JSON.stringify({
  dimension: "Region",
  actualMeasure: "Actual",
  referenceMeasure: "Target",
  items: [
    {
      id: "CZ",
      label: "Česko",
      actualValue: 15200,
      referenceValue: 13000
    },
    {
      id: "SK",
      label: "Slovensko",
      actualValue: 9800,
      referenceValue: 10500
    }
  ]
}));
```

## Optional breakdown style config

```javascript
var cfg =
  '{' +
  '"dimensionBreakdownEnabled":true,' +
  '"maxBreakdownItems":50,' +
  '"breakdownItemHeight":78,' +
  '"breakdownItemGap":8,' +
  '"showDimensionLabel":true,' +
  '"dimensionLabelPosition":"top"' +
  '}';

KpiPipelineBullet_1.setConfig(cfg);
```

## Notes

- If `dimensionBreakdownEnabled` is `false`, the widget renders the original single bullet.
- If `setResultSet()` or `setDataJson()` receives item data and no explicit `dimensionBreakdownEnabled` value is provided, breakdown mode is enabled automatically.
- Supported result set shapes include wide result sets with measure columns and long result sets with `@MeasureDimension`.
