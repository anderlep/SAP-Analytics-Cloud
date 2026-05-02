
# KPI Pipeline Bullet

**Version:** 1.6.0  
**Vendor:** petr.anderle@mathematix.cz  
**License:** N/A

![KPI Pipeline Bullet Icon](https://anderlep.github.io/SAP-Analytics-Cloud/kpi-pipeline-bullet/icon.png)

## Description
The KPI Pipeline Bullet is a custom SAP Analytics Cloud (SAC) widget designed to display KPI metrics as a bullet chart. This widget allows for the visualization of actual and reference values with dynamic zones and configurable visual properties. Key features include hover variance, reference lines, smart tooltips, and adaptive layout fallbacks.

## Features
- **Dynamic Zones:** Set lower, target, and upper bounds for the KPI range.
- **Customizable Colors:** Customize the color of each zone (lower, target, upper).
- **Variance Indicator:** Display the variance relative to the target value.
- **Reference Line:** Display a reference line at a specific value.
- **Responsive Layout:** Fully responsive design with fallback options for smaller screens.
- **Smart Tooltips:** Dynamic tooltips that show additional information.
- **Mobile Support:** Fully optimized for mobile views.

## Installation
To use the widget, include the web component JavaScript file:

```html
<script src="https://anderlep.github.io/SAP-Analytics-Cloud/kpi-pipeline-bullet/kpi-pipeline-bullet.js"></script>
```

Ensure that your project supports web components.

## Properties
| Property                        | Type    | Default Value | Description                                                                 |
|----------------------------------|---------|---------------|-----------------------------------------------------------------------------|
| `actualValue`                    | number  | 450           | The actual KPI value.                                                       |
| `referenceValue`                 | number  | 500           | The reference KPI value (target value).                                      |
| `lowerBoundZonePercentage`       | number  | 40            | Percentage of the lower zone.                                                |
| `targetZonePercentage`           | number  | 20            | Percentage of the target zone.                                               |
| `upperBoundZonePercentage`       | number  | 40            | Percentage of the upper zone.                                                |
| `lowerBoundZoneColor`            | string  | "#E74C3C"     | Color of the lower zone.                                                    |
| `targetZoneColor`                | string  | "#2ECC71"     | Color of the target zone.                                                   |
| `upperBoundZoneColor`            | string  | "#F1C40F"     | Color of the upper zone.                                                    |
| `markerColor`                    | string  | "#2F3C7E"     | Color of the marker.                                                        |
| `referenceLineColor`             | string  | "#111111"     | Color of the reference line.                                                |
| `showLabels`                     | boolean | true          | Whether to show labels for the zones.                                        |
| `showMarkerLabel`                | boolean | true          | Whether to show a label on the marker.                                       |
| `showAxisLabels`                 | boolean | false         | Whether to display axis labels.                                              |
| `showReferenceLine`              | boolean | false         | Whether to show the reference line.                                          |
| `referenceLineOnHover`           | boolean | true          | Whether the reference line appears on hover.                                |
| `showVarianceIndicator`          | boolean | false         | Whether to display the variance indicator.                                   |
| `varianceOnHover`                | boolean | true          | Whether the variance is shown on hover.                                      |
| `varianceLineStyle`              | string  | "dashed"      | The line style of the variance indicator.                                    |
| `varianceDisplayMode`            | string  | "percentage"  | The display mode for variance (percentage or absolute).                      |

## Methods
### `setData`
```javascript
setData(actualValue, referenceValue)
```
Sets the actual and reference values for the KPI.

### `setZones`
```javascript
setZones(lowerBoundZonePercentage, targetZonePercentage, upperBoundZonePercentage)
```
Sets the percentages for the lower, target, and upper zones. The sum must be 100.

### `setColors`
```javascript
setColors(lowerBoundZoneColor, targetZoneColor, upperBoundZoneColor, markerColor)
```
Sets the colors for the zones and optionally the marker.

### `setVarianceDisplayMode`
```javascript
setVarianceDisplayMode(mode)
```
Sets the variance display mode (e.g., percentage or absolute).

### `setConfig`
```javascript
setConfig(config)
```
Sets multiple properties via a JSON configuration.

## Style Config and integration with SAC

```javascript
// ==============================
// ZONES
// ==============================
var cfg2 =
  '{' +
  '"lowerBoundZonePercentage":20,' +
  '"targetZonePercentage":60,' +
  '"upperBoundZonePercentage":20,' +

// ==============================
// COLORS
// ==============================
  '"lowerBoundZoneColor":"#E74C3C",' +
  '"targetZoneColor":"#2ECC71",' +
  '"upperBoundZoneColor":"#F1C40F",' +
  '"markerColor":"#2F3C7E",' +

// ==============================
// LABELS
// ==============================
  '"showAxisLabels":false,' +
  '"showMarkerLabel":true,' +

// ==============================
// REFERENCE LINE
// ==============================
  '"showReferenceLine":false,' +
  '"referenceLineOnHover":true,' +

// ==============================
// VARIANCE
// ==============================
  '"showVarianceIndicator":false,' +
  '"varianceOnHover":true,' +
  '"varianceLineStyle":"dashed",' +
  '"varianceDisplayMode":"both",' +

// ==============================
// PADDING
// ==============================
  '"paddingTop":8,' +
  '"paddingLeft":8,' +
  '"paddingRight":8,' +
  '"paddingBottom":16,' +

// ==============================
// SIZING
// ==============================
  '"barHeight":28,' +
  '"markerWidth":2,' +
  '"markerRadius":2,' +
  '"referenceLineWidth":2,' +
  '"varianceLineWidth":1,' +

// ==============================
// TYPOGRAPHY
// ==============================
  '"fontFamily":"Arial, Helvetica, sans-serif",' +
  '"fontSize":11,' +
  '"fontWeight":"normal",' +
  '"fontStyle":"normal",' +
  '"textColor":"#1f2d3d",' +

// ==============================
// TYPOGRAPHY OVERRIDE
// ==============================
  '"axisFontSize":10,' +
  '"markerFontSize":12,' +

// ==============================
// SEMANTIC
// ==============================
  '"semanticIconVisible":true,' +
  '"semanticIconPosition":"before",' +
  '"semanticIconInMarkerLabel":true,' +      
  '"semanticIconInTooltip":true,' +          
  '"showSemanticStatusInTooltip":false,' +   

// ==============================
// SEMANTIC RULES
// ==============================
  '"semanticRules":[' +
    '{"metric":"variancePercent","operator":"lt","value":0,"textColor":"#E74C3C","icon":"▼"},' +
    '{"metric":"variancePercent","operator":"between","min":0,"max":0.6,"textColor":"#2ECC71","icon":"●"},' +
    '{"metric":"variancePercent","operator":"gt","value":0.4,"textColor":"#F1C40F","icon":"▲"}' +
  '],' +

// ==============================
// RESPONSIVE
// ==============================
  '"responsiveScaling":true,' +

// ==============================
// ADAPTIVE LAYOUT
// ==============================
  '"adaptiveLayout":true,' +
  '"compactHeightThreshold":100,' +      // hide variance + reference
  '"minimalHeightThreshold":80,' +       // hide variance + marker
  '"hideVarianceWhenCompact":true,' +
  '"hideReferenceLineWhenCompact":true,' +
  '"hideMarkerLabelWhenMinimal":true' +

  '}';

KpiPipelineBullet_1.setData(15200, 13000);
KpiPipelineBullet_1.setConfig(cfg2);
```


## Events
Currently, no events are provided by this widget.

## License
This widget is provided as-is with no license specified. Please refer to the vendor for further licensing details.

## Contact
For more information or support, please contact **petr.anderle@mathematix.cz**.
