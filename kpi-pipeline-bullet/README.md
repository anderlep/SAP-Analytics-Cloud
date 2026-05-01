# KPI Pipeline Bullet – SAC Custom Widget v1

## Files
- `kpi-pipeline-bullet.json` – SAC contribution metadata
- `kpi-pipeline-bullet.js` – main web component
- `icon.png` – placeholder icon

## Before upload to SAC
Replace:

`https://YOUR_HOST/customwidgets/kpi-pipeline-bullet/`

in `kpi-pipeline-bullet.json` with the HTTPS URL where you host these files.

## Naming
- Folder / repo: `kpi-pipeline-bullet`
- SAC display name: `KPI Pipeline Bullet`
- Web component tag: `kpi-pipeline-bullet`
- JS class: `KpiPipelineBullet`
- JSON id: `com.pa.kpi-pipeline-bullet`

## Main logic
- `actualValue` = ukazatel 1, e.g. current year / marker
- `referenceValue` = ukazatel 2, e.g. previous year / start of target zone
- `lowerBoundZonePercentage`, `targetZonePercentage`, `upperBoundZonePercentage` must sum to 100

Default zones:
- lowerBoundZone: 40 %
- targetZone: 20 %
- upperBoundZone: 40 %

## Variance
`variance = actualValue - referenceValue`

`variancePercent = variance / referenceValue`

`varianceDisplayMode`:
- `both` – raw and percent
- `raw` – raw only
- `percent` – percent only
- `none` – arrow only

## Scripting examples
```javascript
KpiPipelineBullet_1.setData(450, 500);
KpiPipelineBullet_1.setZones(40, 20, 40);
KpiPipelineBullet_1.varianceDisplayMode = "both";
KpiPipelineBullet_1.setColors("#E74C3C", "#2ECC71", "#F1C40F", "#2F3C7E");
```
