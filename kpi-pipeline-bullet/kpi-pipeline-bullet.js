(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: var(--kpb-font-family, "72", Arial, Helvetica, sans-serif);
        box-sizing: border-box;
      }

      .root {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 8px;
        color: var(--kpb-text-color, #32363a);
      }

      svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      text {
        font-family: var(--kpb-font-family, "72", Arial, Helvetica, sans-serif);
        font-weight: var(--kpb-font-weight, normal);
        font-style: var(--kpb-font-style, normal);
        fill: var(--kpb-text-color, #32363a);
      }

      .muted {
        fill: var(--kpb-text-color, #6a6d70);
        opacity: 0.78;
      }

      .error {
        color: #bb0000;
        font-size: 12px;
        padding: 8px;
      }

      .variance-layer {
        opacity: 0;
        transition: opacity 0.15s ease-in-out;
        pointer-events: none;
      }

      :host(:hover) .variance-layer {
        opacity: 1;
      }

      .variance-layer.always-visible {
        opacity: 1;
      }

      .reference-line-layer {
        opacity: 0;
        transition: opacity 0.15s ease-in-out;
        pointer-events: none;
      }

      :host(:hover) .reference-line-layer {
        opacity: 1;
      }

      .reference-line-layer.always-visible {
        opacity: 1;
      }


      .kpb-list {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: auto;
      }

      .kpb-item {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        min-height: 42px;
      }

      .kpb-item.kpb-label-left {
        flex-direction: row;
        align-items: stretch;
      }

      .kpb-title {
        box-sizing: border-box;
        font-family: var(--kpb-font-family, "72", Arial, Helvetica, sans-serif);
        font-weight: var(--kpb-font-weight, normal);
        font-style: var(--kpb-font-style, normal);
        color: var(--kpb-text-color, #32363a);
        font-size: var(--kpb-breakdown-label-font-size, 12px);
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .kpb-item.kpb-label-top .kpb-title {
        padding: 0 2px 4px 2px;
      }

      .kpb-item.kpb-label-left .kpb-title {
        flex: 0 0 var(--kpb-breakdown-label-width, 120px);
        padding: 0 8px 0 2px;
        display: flex;
        align-items: center;
      }

      .kpb-chart {
        width: 100%;
        min-width: 0;
        flex: 1 1 auto;
      }

      .kpb-chart kpi-pipeline-bullet {
        display: block;
        width: 100%;
        height: 100%;
      }

      .marker-hit {
        cursor: default;
        pointer-events: all;
      }
    </style>
    <div class="root"></div>
  `;

  class KpiPipelineBullet extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this._root = this.shadowRoot.querySelector(".root");
      this._resizeObserver = null;
      this._tooltip = null;
      this._tooltipArrow = null;

      this._state = {
        actualValue: 450,
        referenceValue: 500,

        lowerBoundZonePercentage: 40,
        targetZonePercentage: 20,
        upperBoundZonePercentage: 40,

        lowerBoundZoneColor: "#E74C3C",
        targetZoneColor: "#2ECC71",
        upperBoundZoneColor: "#F1C40F",
        markerColor: "#2F3C7E",
        referenceLineColor: "#111111",
        varianceColor: "#5E6978",

        showLabels: true,
        showMarkerLabel: true,
        showAxisLabels: false,

        showReferenceLine: false,
        referenceLineOnHover: true,

        showVarianceIndicator: false,
        varianceOnHover: true,
        varianceLineStyle: "dashed",
        varianceDisplayMode: "both",
        varianceSeparator: " | ",

        showTooltip: true,

        barHeight: 18,
        markerWidth: 3,
        markerRadius: 4,
        referenceLineWidth: 2,
        varianceLineWidth: 1.2,

        fontFamily: "\"72\", Arial, Helvetica, sans-serif",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        textColor: "#32363a",
        axisFontSize: 11,
        markerFontSize: 13,

        responsiveScaling: false,

        adaptiveLayout: true,
        compactHeightThreshold: 95,
        minimalHeightThreshold: 70,
        hideVarianceWhenCompact: true,
        hideReferenceLineWhenCompact: true,
        hideMarkerLabelWhenMinimal: true,

        paddingTop: 34,
        paddingLeft: 28,
        paddingRight: 28,
        paddingBottom: 24,

        semanticRules: [],
        semanticIconVisible: true,
        semanticIconPosition: "before",
        semanticIconInTooltip: true,
        semanticIconInMarkerLabel: false,
        showSemanticStatusInTooltip: false,

        dimensionBreakdownEnabled: true,
        dimensionId: "",
        actualMeasureId: "",
        referenceMeasureId: "",
        dataRows: [],
        maxBreakdownItems: 50,
        breakdownItemHeight: 78,
        breakdownItemGap: 8,
        showDimensionLabel: true,
        dimensionLabelPosition: "top",
        dimensionLabelWidth: 120,
        emptyDataText: "No data available.",

        rawDecimals: 0,
        percentDecimals: 1,
        unit: "",
        clampMarker: true
      };
    }

    static get observedAttributes() {
      return [
        "actual-value",
        "reference-value",
        "lower-bound-zone-percentage",
        "target-zone-percentage",
        "upper-bound-zone-percentage",
        "lower-bound-zone-color",
        "target-zone-color",
        "upper-bound-zone-color",
        "marker-color",
        "reference-line-color",
        "variance-color",
        "show-labels",
        "show-marker-label",
        "show-axis-labels",
        "show-reference-line",
        "reference-line-on-hover",
        "show-variance-indicator",
        "variance-on-hover",
        "variance-line-style",
        "variance-display-mode",
        "variance-separator",
        "show-tooltip",
        "bar-height",
        "marker-width",
        "marker-radius",
        "reference-line-width",
        "variance-line-width",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "text-color",
        "axis-font-size",
        "marker-font-size",
        "responsive-scaling",
        "adaptive-layout",
        "compact-height-threshold",
        "minimal-height-threshold",
        "hide-variance-when-compact",
        "hide-reference-line-when-compact",
        "hide-marker-label-when-minimal",
        "padding-top",
        "padding-left",
        "padding-right",
        "padding-bottom",
        "semantic-rules",
        "semantic-icon-visible",
        "semantic-icon-position",
        "semantic-icon-in-tooltip",
        "semantic-icon-in-marker-label",
        "show-semantic-status-in-tooltip",
        "dimension-breakdown-enabled",
        "dimension-id",
        "actual-measure-id",
        "reference-measure-id",
        "data-rows",
        "max-breakdown-items",
        "breakdown-item-height",
        "breakdown-item-gap",
        "show-dimension-label",
        "dimension-label-position",
        "dimension-label-width",
        "empty-data-text",
        "raw-decimals",
        "percent-decimals",
        "unit",
        "clamp-marker"
      ];
    }

    connectedCallback() {
      this._upgradeProperties(Object.keys(this._state));

      this._resizeObserver = new ResizeObserver(() => this.render());
      this._resizeObserver.observe(this);

      this.render();
    }

    disconnectedCallback() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
      }

      this._removeTooltip();
    }

    onCustomWidgetAfterUpdate() {
      this.render();
    }

    onCustomWidgetResize() {
      this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;

      const prop = this._attributeToProperty(name);
      if (prop in this._state) {
        this._state[prop] = this._parseValue(prop, newValue);
        this.render();
      }
    }

    _upgradeProperties(props) {
      props.forEach((prop) => {
        if (Object.prototype.hasOwnProperty.call(this, prop)) {
          const value = this[prop];
          delete this[prop];
          this[prop] = value;
        }
      });
    }

    _attributeToProperty(attr) {
      return attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    }

    _parseValue(prop, value) {
      if (value === null || value === undefined) {
        return this._state[prop];
      }

      if (Array.isArray(this._state[prop])) {
        if (Array.isArray(value)) return value;

        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : this._state[prop];
          } catch (e) {
            return this._state[prop];
          }
        }

        return this._state[prop];
      }

      if (typeof this._state[prop] === "boolean") {
        return value === true || value === "true";
      }

      if (typeof this._state[prop] === "number") {
        const n = Number(value);
        return Number.isFinite(n) ? n : this._state[prop];
      }

      return String(value);
    }

    _set(prop, value) {
      this._state[prop] = this._parseValue(prop, value);
      this.render();
    }

    get actualValue() { return this._state.actualValue; }
    set actualValue(v) { this._set("actualValue", v); }

    get referenceValue() { return this._state.referenceValue; }
    set referenceValue(v) { this._set("referenceValue", v); }

    get lowerBoundZonePercentage() { return this._state.lowerBoundZonePercentage; }
    set lowerBoundZonePercentage(v) { this._set("lowerBoundZonePercentage", v); }

    get targetZonePercentage() { return this._state.targetZonePercentage; }
    set targetZonePercentage(v) { this._set("targetZonePercentage", v); }

    get upperBoundZonePercentage() { return this._state.upperBoundZonePercentage; }
    set upperBoundZonePercentage(v) { this._set("upperBoundZonePercentage", v); }

    get lowerBoundZoneColor() { return this._state.lowerBoundZoneColor; }
    set lowerBoundZoneColor(v) { this._set("lowerBoundZoneColor", v); }

    get targetZoneColor() { return this._state.targetZoneColor; }
    set targetZoneColor(v) { this._set("targetZoneColor", v); }

    get upperBoundZoneColor() { return this._state.upperBoundZoneColor; }
    set upperBoundZoneColor(v) { this._set("upperBoundZoneColor", v); }

    get markerColor() { return this._state.markerColor; }
    set markerColor(v) { this._set("markerColor", v); }

    get referenceLineColor() { return this._state.referenceLineColor; }
    set referenceLineColor(v) { this._set("referenceLineColor", v); }

    get varianceColor() { return this._state.varianceColor; }
    set varianceColor(v) { this._set("varianceColor", v); }

    get showLabels() { return this._state.showLabels; }
    set showLabels(v) { this._set("showLabels", v); }

    get showMarkerLabel() { return this._state.showMarkerLabel; }
    set showMarkerLabel(v) { this._set("showMarkerLabel", v); }

    get showAxisLabels() { return this._state.showAxisLabels; }
    set showAxisLabels(v) { this._set("showAxisLabels", v); }

    get showReferenceLine() { return this._state.showReferenceLine; }
    set showReferenceLine(v) { this._set("showReferenceLine", v); }

    get referenceLineOnHover() { return this._state.referenceLineOnHover; }
    set referenceLineOnHover(v) { this._set("referenceLineOnHover", v); }

    get showVarianceIndicator() { return this._state.showVarianceIndicator; }
    set showVarianceIndicator(v) { this._set("showVarianceIndicator", v); }

    get varianceOnHover() { return this._state.varianceOnHover; }
    set varianceOnHover(v) { this._set("varianceOnHover", v); }

    get varianceLineStyle() { return this._state.varianceLineStyle; }
    set varianceLineStyle(v) { this._set("varianceLineStyle", v); }

    get varianceDisplayMode() { return this._state.varianceDisplayMode; }
    set varianceDisplayMode(v) { this._set("varianceDisplayMode", v); }

    get varianceSeparator() { return this._state.varianceSeparator; }
    set varianceSeparator(v) { this._set("varianceSeparator", v); }

    get showTooltip() { return this._state.showTooltip; }
    set showTooltip(v) { this._set("showTooltip", v); }

    get barHeight() { return this._state.barHeight; }
    set barHeight(v) { this._set("barHeight", v); }

    get markerWidth() { return this._state.markerWidth; }
    set markerWidth(v) { this._set("markerWidth", v); }

    get markerRadius() { return this._state.markerRadius; }
    set markerRadius(v) { this._set("markerRadius", v); }

    get referenceLineWidth() { return this._state.referenceLineWidth; }
    set referenceLineWidth(v) { this._set("referenceLineWidth", v); }

    get varianceLineWidth() { return this._state.varianceLineWidth; }
    set varianceLineWidth(v) { this._set("varianceLineWidth", v); }

    get fontFamily() { return this._state.fontFamily; }
    set fontFamily(v) { this._set("fontFamily", v); }

    get fontSize() { return this._state.fontSize; }
    set fontSize(v) { this._set("fontSize", v); }

    get fontWeight() { return this._state.fontWeight; }
    set fontWeight(v) { this._set("fontWeight", v); }

    get fontStyle() { return this._state.fontStyle; }
    set fontStyle(v) { this._set("fontStyle", v); }

    get textColor() { return this._state.textColor; }
    set textColor(v) { this._set("textColor", v); }

    get axisFontSize() { return this._state.axisFontSize; }
    set axisFontSize(v) { this._set("axisFontSize", v); }

    get markerFontSize() { return this._state.markerFontSize; }
    set markerFontSize(v) { this._set("markerFontSize", v); }

    get responsiveScaling() { return this._state.responsiveScaling; }
    set responsiveScaling(v) { this._set("responsiveScaling", v); }

    get adaptiveLayout() { return this._state.adaptiveLayout; }
    set adaptiveLayout(v) { this._set("adaptiveLayout", v); }

    get compactHeightThreshold() { return this._state.compactHeightThreshold; }
    set compactHeightThreshold(v) { this._set("compactHeightThreshold", v); }

    get minimalHeightThreshold() { return this._state.minimalHeightThreshold; }
    set minimalHeightThreshold(v) { this._set("minimalHeightThreshold", v); }

    get hideVarianceWhenCompact() { return this._state.hideVarianceWhenCompact; }
    set hideVarianceWhenCompact(v) { this._set("hideVarianceWhenCompact", v); }

    get hideReferenceLineWhenCompact() { return this._state.hideReferenceLineWhenCompact; }
    set hideReferenceLineWhenCompact(v) { this._set("hideReferenceLineWhenCompact", v); }

    get hideMarkerLabelWhenMinimal() { return this._state.hideMarkerLabelWhenMinimal; }
    set hideMarkerLabelWhenMinimal(v) { this._set("hideMarkerLabelWhenMinimal", v); }

    get paddingTop() { return this._state.paddingTop; }
    set paddingTop(v) { this._set("paddingTop", v); }

    get paddingLeft() { return this._state.paddingLeft; }
    set paddingLeft(v) { this._set("paddingLeft", v); }

    get paddingRight() { return this._state.paddingRight; }
    set paddingRight(v) { this._set("paddingRight", v); }

    get paddingBottom() { return this._state.paddingBottom; }
    set paddingBottom(v) { this._set("paddingBottom", v); }

    get semanticRules() { return this._state.semanticRules; }
    set semanticRules(v) { this._set("semanticRules", v); }

    get semanticIconVisible() { return this._state.semanticIconVisible; }
    set semanticIconVisible(v) { this._set("semanticIconVisible", v); }

    get semanticIconPosition() { return this._state.semanticIconPosition; }
    set semanticIconPosition(v) { this._set("semanticIconPosition", v); }

    get semanticIconInTooltip() { return this._state.semanticIconInTooltip; }
    set semanticIconInTooltip(v) { this._set("semanticIconInTooltip", v); }

    get semanticIconInMarkerLabel() { return this._state.semanticIconInMarkerLabel; }
    set semanticIconInMarkerLabel(v) { this._set("semanticIconInMarkerLabel", v); }

    get showSemanticStatusInTooltip() { return this._state.showSemanticStatusInTooltip; }
    set showSemanticStatusInTooltip(v) { this._set("showSemanticStatusInTooltip", v); }

    get rawDecimals() { return this._state.rawDecimals; }
    set rawDecimals(v) { this._set("rawDecimals", v); }

    get percentDecimals() { return this._state.percentDecimals; }
    set percentDecimals(v) { this._set("percentDecimals", v); }

    get unit() { return this._state.unit; }
    set unit(v) { this._set("unit", v); }

    get clampMarker() { return this._state.clampMarker; }
    set clampMarker(v) { this._set("clampMarker", v); }

    get dimensionBreakdownEnabled() { return this._state.dimensionBreakdownEnabled; }
    set dimensionBreakdownEnabled(v) { this._set("dimensionBreakdownEnabled", v); }

    get dimensionId() { return this._state.dimensionId; }
    set dimensionId(v) { this._set("dimensionId", v); }

    get actualMeasureId() { return this._state.actualMeasureId; }
    set actualMeasureId(v) { this._set("actualMeasureId", v); }

    get referenceMeasureId() { return this._state.referenceMeasureId; }
    set referenceMeasureId(v) { this._set("referenceMeasureId", v); }

    get dataRows() { return this._state.dataRows; }
    set dataRows(v) { this._set("dataRows", v); }

    get maxBreakdownItems() { return this._state.maxBreakdownItems; }
    set maxBreakdownItems(v) { this._set("maxBreakdownItems", v); }

    get breakdownItemHeight() { return this._state.breakdownItemHeight; }
    set breakdownItemHeight(v) { this._set("breakdownItemHeight", v); }

    get breakdownItemGap() { return this._state.breakdownItemGap; }
    set breakdownItemGap(v) { this._set("breakdownItemGap", v); }

    get showDimensionLabel() { return this._state.showDimensionLabel; }
    set showDimensionLabel(v) { this._set("showDimensionLabel", v); }

    get dimensionLabelPosition() { return this._state.dimensionLabelPosition; }
    set dimensionLabelPosition(v) { this._set("dimensionLabelPosition", v); }

    get dimensionLabelWidth() { return this._state.dimensionLabelWidth; }
    set dimensionLabelWidth(v) { this._set("dimensionLabelWidth", v); }

    get emptyDataText() { return this._state.emptyDataText; }
    set emptyDataText(v) { this._set("emptyDataText", v); }

    setData(actualValue, referenceValue) {
      this._state.actualValue = Number(actualValue);
      this._state.referenceValue = Number(referenceValue);
      this.render();
    }

    setZones(lowerBoundZonePercentage, targetZonePercentage, upperBoundZonePercentage) {
      this._state.lowerBoundZonePercentage = Number(lowerBoundZonePercentage);
      this._state.targetZonePercentage = Number(targetZonePercentage);
      this._state.upperBoundZonePercentage = Number(upperBoundZonePercentage);
      this.render();
    }

    setColors(lowerBoundZoneColor, targetZoneColor, upperBoundZoneColor, markerColor) {
      this._state.lowerBoundZoneColor = String(lowerBoundZoneColor);
      this._state.targetZoneColor = String(targetZoneColor);
      this._state.upperBoundZoneColor = String(upperBoundZoneColor);

      if (markerColor !== undefined) {
        this._state.markerColor = String(markerColor);
      }

      this.render();
    }

    setVarianceDisplayMode(mode) {
      const allowed = ["both", "raw", "percent", "none"];
      this._state.varianceDisplayMode = allowed.includes(mode) ? mode : "both";
      this.render();
    }

    setConfig(config) {
      try {
        const cfg = typeof config === "string" ? JSON.parse(config) : config;

        Object.keys(cfg).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(this._state, key)) {
            this._state[key] = this._parseValue(key, cfg[key]);
          }
        });

        this.render();
      } catch (e) {
        console.error("Invalid config JSON", e);
        if (this._root) {
          this._root.innerHTML = '<div class="error">Invalid config JSON.</div>';
        }
      }
    }


    setDataRows(dataRows) {
      this._state.dataRows = this._parseValue("dataRows", dataRows);
      this.render();
    }

    setDimensionBinding(dimensionId, actualMeasureId, referenceMeasureId) {
      this._state.dimensionId = dimensionId === undefined || dimensionId === null ? "" : String(dimensionId);
      this._state.actualMeasureId = actualMeasureId === undefined || actualMeasureId === null ? "" : String(actualMeasureId);
      this._state.referenceMeasureId = referenceMeasureId === undefined || referenceMeasureId === null ? "" : String(referenceMeasureId);
      this.render();
    }

    setDimensionBreakdownEnabled(enabled) {
      this._state.dimensionBreakdownEnabled = this._parseValue("dimensionBreakdownEnabled", enabled);
      this.render();
    }


    _getActiveDataBinding() {
      if (this.dataBinding && Array.isArray(this.dataBinding.data)) {
        return this.dataBinding;
      }

      if (this.myDataBinding && Array.isArray(this.myDataBinding.data)) {
        return this.myDataBinding;
      }

      if (this.dataBindings) {
        if (typeof this.dataBindings.getDataBinding === "function") {
          try {
            const binding = this.dataBindings.getDataBinding("dataBinding");
            if (binding && Array.isArray(binding.data)) return binding;
          } catch (e) {
            // Some SAC runtimes expose data binding directly as this.dataBinding.
          }
        }

        if (this.dataBindings.dataBinding && Array.isArray(this.dataBindings.dataBinding.data)) {
          return this.dataBindings.dataBinding;
        }
      }

      return null;
    }

    _getFeedValues(metadata, feedId, fallbackPrefix) {
      if (metadata && metadata.feeds && metadata.feeds[feedId] && Array.isArray(metadata.feeds[feedId].values)) {
        return metadata.feeds[feedId].values.slice();
      }

      if (metadata && metadata.feeds) {
        const matchingFeed = Object.keys(metadata.feeds)
          .map((key) => metadata.feeds[key])
          .find((feed) => feed && feed.type && String(feed.type).toLowerCase() === String(fallbackPrefix).toLowerCase() && Array.isArray(feed.values));

        if (matchingFeed) return matchingFeed.values.slice();
      }

      return [];
    }

    _inferBindingKeys(rows, preferredPrefix) {
      const first = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (!first || typeof first !== "object") return [];

      const keys = Object.keys(first);
      const preferred = keys.filter((key) => key.indexOf(preferredPrefix) === 0);
      return preferred.length ? preferred : keys;
    }

    _selectBindingKey(keys, configuredValue, metadataMap, fallbackIndex) {
      if (!Array.isArray(keys) || !keys.length) return "";

      const fallback = keys[Math.min(Math.max(0, fallbackIndex || 0), keys.length - 1)];
      if (configuredValue === undefined || configuredValue === null || String(configuredValue).trim() === "") {
        return fallback;
      }

      const wanted = String(configuredValue).trim();

      return keys.find((key) => {
        const meta = metadataMap && metadataMap[key] ? metadataMap[key] : {};
        return String(key) === wanted ||
          String(meta.id || "") === wanted ||
          String(meta.label || "") === wanted ||
          String(meta.description || "") === wanted;
      }) || fallback;
    }

    _cellRawValue(cell) {
      if (cell === undefined || cell === null) return NaN;
      if (typeof cell === "number") return cell;
      if (typeof cell === "string") {
        const n = Number(cell.replace(/\s/g, "").replace(",", "."));
        return Number.isFinite(n) ? n : NaN;
      }

      if (typeof cell === "object") {
        const candidates = [cell.raw, cell.value, cell.number, cell.data, cell.formattedValue];
        for (let i = 0; i < candidates.length; i += 1) {
          const candidate = candidates[i];
          if (candidate === undefined || candidate === null) continue;
          if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
          if (typeof candidate === "string") {
            const n = Number(candidate.replace(/\s/g, "").replace(",", "."));
            if (Number.isFinite(n)) return n;
          }
        }
      }

      return NaN;
    }

    _cellLabel(cell) {
      if (cell === undefined || cell === null) return "";
      if (typeof cell === "string" || typeof cell === "number") return String(cell);

      if (typeof cell === "object") {
        return String(cell.label || cell.description || cell.id || cell.formatted || cell.raw || "");
      }

      return String(cell);
    }

    _metadataLabel(metadataMap, key) {
      const meta = metadataMap && metadataMap[key] ? metadataMap[key] : null;
      if (!meta) return key;
      return meta.description || meta.label || meta.id || key;
    }

    _getItemsFromSacBinding(binding) {
      if (!binding || !Array.isArray(binding.data) || !binding.data.length) return [];

      const metadata = binding.metadata || {};
      const dimensionKeys = this._getFeedValues(metadata, "dimensions", "dimension");
      const measureKeys = this._getFeedValues(metadata, "measures", "mainStructureMember");

      const inferredDimensionKeys = dimensionKeys.length ? dimensionKeys : this._inferBindingKeys(binding.data, "dimensions_");
      const inferredMeasureKeys = measureKeys.length ? measureKeys : this._inferBindingKeys(binding.data, "measures_");

      const dimensionKey = this._selectBindingKey(
        inferredDimensionKeys,
        this._state.dimensionId,
        metadata.dimensions,
        0
      );

      const actualKey = this._selectBindingKey(
        inferredMeasureKeys,
        this._state.actualMeasureId,
        metadata.mainStructureMembers || metadata.measures,
        0
      );

      const referenceKey = this._selectBindingKey(
        inferredMeasureKeys,
        this._state.referenceMeasureId,
        metadata.mainStructureMembers || metadata.measures,
        actualKey === inferredMeasureKeys[0] ? 1 : 0
      );

      if (!dimensionKey || !actualKey || !referenceKey || actualKey === referenceKey) return [];

      const grouped = new Map();

      binding.data.forEach((row) => {
        const dimensionCell = row[dimensionKey];
        const label = this._cellLabel(dimensionCell) || "–";
        const id = dimensionCell && typeof dimensionCell === "object" && dimensionCell.id ? String(dimensionCell.id) : label;
        const actual = this._cellRawValue(row[actualKey]);
        const reference = this._cellRawValue(row[referenceKey]);

        if (!Number.isFinite(actual) && !Number.isFinite(reference)) return;

        if (!grouped.has(id)) {
          grouped.set(id, {
            id,
            label,
            actualValue: 0,
            referenceValue: 0,
            dimensionKey,
            actualMeasureKey: actualKey,
            referenceMeasureKey: referenceKey,
            dimensionName: this._metadataLabel(metadata.dimensions, dimensionKey),
            actualMeasureName: this._metadataLabel(metadata.mainStructureMembers || metadata.measures, actualKey),
            referenceMeasureName: this._metadataLabel(metadata.mainStructureMembers || metadata.measures, referenceKey)
          });
        }

        const item = grouped.get(id);
        if (Number.isFinite(actual)) item.actualValue += actual;
        if (Number.isFinite(reference)) item.referenceValue += reference;
      });

      return Array.from(grouped.values());
    }

    _getItemsFromRows(rows) {
      if (!Array.isArray(rows) || !rows.length) return [];

      return rows.map((row, index) => {
        if (Array.isArray(row)) {
          return {
            id: String(row[0] !== undefined ? row[0] : index),
            label: String(row[0] !== undefined ? row[0] : index + 1),
            actualValue: this._cellRawValue(row[1]),
            referenceValue: this._cellRawValue(row[2])
          };
        }

        if (!row || typeof row !== "object") return null;

        const keys = Object.keys(row);
        const configuredDimension = this._state.dimensionId;
        const configuredActual = this._state.actualMeasureId;
        const configuredReference = this._state.referenceMeasureId;

        const dimensionKey = configuredDimension && keys.includes(configuredDimension)
          ? configuredDimension
          : (keys.find((key) => typeof row[key] === "string" || (row[key] && typeof row[key] === "object" && ("label" in row[key] || "id" in row[key]))) || keys[0]);

        const numericKeys = keys.filter((key) => key !== dimensionKey && Number.isFinite(this._cellRawValue(row[key])));
        const actualKey = configuredActual && keys.includes(configuredActual) ? configuredActual : (keys.includes("actualValue") ? "actualValue" : numericKeys[0]);
        const referenceKey = configuredReference && keys.includes(configuredReference) ? configuredReference : (keys.includes("referenceValue") ? "referenceValue" : numericKeys.find((key) => key !== actualKey));

        if (!dimensionKey || !actualKey || !referenceKey) return null;

        return {
          id: this._cellLabel(row[dimensionKey]) || String(index),
          label: this._cellLabel(row[dimensionKey]) || String(index + 1),
          actualValue: this._cellRawValue(row[actualKey]),
          referenceValue: this._cellRawValue(row[referenceKey])
        };
      }).filter((item) => item && Number.isFinite(item.actualValue) && Number.isFinite(item.referenceValue));
    }

    _getDimensionBreakdownItems() {
      if (!this._state.dimensionBreakdownEnabled) return [];

      const bindingItems = this._getItemsFromSacBinding(this._getActiveDataBinding());
      if (bindingItems.length) return bindingItems;

      return this._getItemsFromRows(this._state.dataRows);
    }

    _renderDimensionBreakdown(items) {
      const s = this._state;
      const maxItems = Math.max(1, Number(s.maxBreakdownItems) || 50);
      const visibleItems = items.slice(0, maxItems);
      const itemHeight = Math.max(42, Number(s.breakdownItemHeight) || 78);
      const gap = Math.max(0, Number(s.breakdownItemGap) || 0);
      const labelPosition = String(s.dimensionLabelPosition || "top").toLowerCase() === "left" ? "left" : "top";
      const showLabel = Boolean(s.showDimensionLabel);

      this._removeTooltip();
      this._root.style.backgroundColor = "transparent";
      this._root.style.setProperty("--kpb-breakdown-label-font-size", `${Math.max(8, Number(s.fontSize))}px`);
      this._root.style.setProperty("--kpb-breakdown-label-width", `${Math.max(40, Number(s.dimensionLabelWidth) || 120)}px`);

      if (!visibleItems.length) {
        this._root.innerHTML = `<div class="error">${this._escapeHtml(s.emptyDataText || "No data available.")}</div>`;
        return;
      }

      const itemClass = labelPosition === "left" ? "kpb-item kpb-label-left" : "kpb-item kpb-label-top";
      const chartHeight = labelPosition === "left" || !showLabel
        ? itemHeight
        : Math.max(34, itemHeight - Math.max(16, Number(s.fontSize) + 6));

      this._root.innerHTML = `
        <div class="kpb-list" role="list" aria-label="KPI Pipeline Bullet breakdown">
          ${visibleItems.map((item, index) => `
            <div class="${itemClass}" role="listitem" style="height:${itemHeight}px;margin-bottom:${index === visibleItems.length - 1 ? 0 : gap}px;">
              ${showLabel ? `<div class="kpb-title" title="${this._escapeHtml(item.label)}">${this._escapeHtml(item.label)}</div>` : ""}
              <div class="kpb-chart" style="height:${chartHeight}px;">
                <kpi-pipeline-bullet data-kpb-child-index="${index}"></kpi-pipeline-bullet>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      const childConfig = {};
      Object.keys(s).forEach((key) => {
        if ([
          "dimensionBreakdownEnabled",
          "dimensionId",
          "actualMeasureId",
          "referenceMeasureId",
          "dataRows",
          "maxBreakdownItems",
          "breakdownItemHeight",
          "breakdownItemGap",
          "showDimensionLabel",
          "dimensionLabelPosition",
          "dimensionLabelWidth",
          "emptyDataText"
        ].includes(key)) {
          return;
        }

        childConfig[key] = s[key];
      });

      childConfig.dimensionBreakdownEnabled = false;

      this.shadowRoot.querySelectorAll("kpi-pipeline-bullet[data-kpb-child-index]").forEach((child) => {
        const index = Number(child.getAttribute("data-kpb-child-index"));
        const item = visibleItems[index];

        child.style.display = "block";
        child.style.width = "100%";
        child.style.height = `${chartHeight}px`;

        if (typeof child.setConfig === "function") {
          child.setConfig(Object.assign({}, childConfig, {
            actualValue: item.actualValue,
            referenceValue: item.referenceValue
          }));
        } else {
          child.actualValue = item.actualValue;
          child.referenceValue = item.referenceValue;
          child.dimensionBreakdownEnabled = false;
        }
      });
    }

    _getSemanticValue(metric, context) {
      if (!metric) return NaN;

      switch (String(metric)) {
        case "actualValue":
        case "actual":
          return context.actual;
        case "referenceValue":
        case "reference":
          return context.reference;
        case "varianceRaw":
        case "variance":
          return context.varianceRaw;
        case "variancePercent":
        case "variancePct":
          return context.variancePct;
        default:
          return NaN;
      }
    }

    _matchesSemanticRule(rule, context) {
      if (!rule || typeof rule !== "object") return false;

      const operator = String(rule.operator || "eq").toLowerCase();
      const actualValue = this._getSemanticValue(rule.metric, context);
      const compareValue = Number(rule.value);
      const minValue = Number(rule.min);
      const maxValue = Number(rule.max);

      if (!Number.isFinite(actualValue)) return false;

      switch (operator) {
        case "lt":
          return Number.isFinite(compareValue) && actualValue < compareValue;
        case "lte":
        case "le":
          return Number.isFinite(compareValue) && actualValue <= compareValue;
        case "gt":
          return Number.isFinite(compareValue) && actualValue > compareValue;
        case "gte":
        case "ge":
          return Number.isFinite(compareValue) && actualValue >= compareValue;
        case "eq":
          return Number.isFinite(compareValue) && actualValue === compareValue;
        case "ne":
        case "neq":
          return Number.isFinite(compareValue) && actualValue !== compareValue;
        case "between":
          return Number.isFinite(minValue) && Number.isFinite(maxValue) && actualValue >= minValue && actualValue <= maxValue;
        case "outside":
          return Number.isFinite(minValue) && Number.isFinite(maxValue) && (actualValue < minValue || actualValue > maxValue);
        default:
          return false;
      }
    }

    _getSemanticRule(context) {
      const rules = Array.isArray(this._state.semanticRules) ? this._state.semanticRules : [];

      for (let i = 0; i < rules.length; i += 1) {
        if (this._matchesSemanticRule(rules[i], context)) {
          return rules[i];
        }
      }

      return null;
    }

    _getSemanticText(rule) {
      if (!rule || !this._state.semanticIconVisible || !rule.icon) return "";
      return this._escapeHtml(rule.icon);
    }

    _formatMarkerLabel(value, rule) {
      const valueText = this._escapeHtml(this._formatNumber(value, this._state.rawDecimals));

      if (!this._state.semanticIconInMarkerLabel) {
        return valueText;
      }

      const icon = this._getSemanticText(rule);

      if (!icon) return valueText;

      return this._state.semanticIconPosition === "after"
        ? `${valueText} ${icon}`
        : `${icon} ${valueText}`;
    }

    _formatTooltipActual(value, rule) {
      const valueText = this._escapeHtml(this._formatNumber(value, this._state.rawDecimals));

      if (!this._state.semanticIconInTooltip) {
        return valueText;
      }

      const icon = this._getSemanticText(rule);

      if (!icon) return valueText;

      return this._state.semanticIconPosition === "after"
        ? `${valueText} ${icon}`
        : `${icon} ${valueText}`;
    }

    _formatNumber(value, decimals) {
      if (!Number.isFinite(value)) return "–";

      return value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + (this._state.unit ? ` ${this._state.unit}` : "");
    }

    _formatVariance(raw, pct) {
      const mode = this._state.varianceDisplayMode;
      if (mode === "none") return "";

      const signRaw = raw > 0 ? "+" : "";
      const signPct = pct > 0 ? "+" : "";

      const rawText = `${signRaw}${this._formatNumber(raw, this._state.rawDecimals)}`;
      const pctText = Number.isFinite(pct)
        ? `${signPct}${(pct * 100).toLocaleString(undefined, {
            minimumFractionDigits: this._state.percentDecimals,
            maximumFractionDigits: this._state.percentDecimals
          })}%`
        : "–";

      if (mode === "raw") return rawText;
      if (mode === "percent") return pctText;

      return `${rawText}${this._state.varianceSeparator}${pctText}`;
    }

    _escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    _createTooltip() {
      if (this._tooltip) return;

      const tooltip = document.createElement("div");
      tooltip.style.position = "fixed";
      tooltip.style.left = "0";
      tooltip.style.top = "0";
      tooltip.style.background = "#3a3f44";
      tooltip.style.color = "#ffffff";
      tooltip.style.padding = "8px 10px";
      tooltip.style.borderRadius = "6px";
      tooltip.style.fontFamily = '"72", Arial, Helvetica, sans-serif';
      tooltip.style.fontSize = "12px";
      tooltip.style.lineHeight = "1.35";
      tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      tooltip.style.zIndex = "2147483647";
      tooltip.style.opacity = "0";
      tooltip.style.pointerEvents = "none";
      tooltip.style.transition = "opacity 0.12s ease-in-out";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.boxSizing = "border-box";
      tooltip.style.maxWidth = "calc(100vw - 16px)";

      const arrow = document.createElement("div");
      arrow.style.position = "absolute";
      arrow.style.width = "10px";
      arrow.style.height = "10px";
      arrow.style.background = "#3a3f44";
      arrow.style.transform = "rotate(45deg)";
      arrow.style.left = "50%";
      arrow.style.marginLeft = "-5px";

      tooltip.appendChild(arrow);

      document.body.appendChild(tooltip);

      this._tooltip = tooltip;
      this._tooltipArrow = arrow;
    }

    _showTooltip(anchorRect, html) {
      if (!this._state.showTooltip) return;

      this._createTooltip();

      const tooltip = this._tooltip;
      const arrow = this._tooltipArrow;

      tooltip.style.fontFamily = this._state.fontFamily;
      tooltip.style.fontSize = `${Math.max(8, Number(this._state.fontSize))}px`;
      tooltip.style.fontWeight = this._state.fontWeight;
      tooltip.style.fontStyle = this._state.fontStyle;

      tooltip.innerHTML = html;
      tooltip.appendChild(arrow);

      tooltip.style.opacity = "0";
      tooltip.style.visibility = "hidden";
      tooltip.style.left = "0px";
      tooltip.style.top = "0px";

      const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      const gap = 12;
      const margin = 8;

      const markerCenterX = anchorRect.left + anchorRect.width / 2;
      const markerTopY = anchorRect.top;
      const markerBottomY = anchorRect.bottom;

      const tooltipRect = tooltip.getBoundingClientRect();
      const tooltipW = tooltipRect.width;
      const tooltipH = tooltipRect.height;

      let placement = "top";
      let top = markerTopY - tooltipH - gap;

      if (top < margin) {
        placement = "bottom";
        top = markerBottomY + gap;
      }

      if (top + tooltipH > viewportH - margin) {
        placement = "top";
        top = Math.max(margin, markerTopY - tooltipH - gap);
      }

      let left = markerCenterX - tooltipW / 2;
      left = Math.max(margin, Math.min(left, viewportW - tooltipW - margin));

      const arrowLeft = markerCenterX - left;
      const safeArrowLeft = Math.max(12, Math.min(arrowLeft, tooltipW - 12));

      if (placement === "top") {
        arrow.style.top = "";
        arrow.style.bottom = "-5px";
      } else {
        arrow.style.bottom = "";
        arrow.style.top = "-5px";
      }

      arrow.style.left = `${safeArrowLeft}px`;
      arrow.style.marginLeft = "-5px";

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";
    }

    _hideTooltip() {
      if (this._tooltip) {
        this._tooltip.style.opacity = "0";
        this._tooltip.style.visibility = "hidden";
      }
    }

    _removeTooltip() {
      if (this._tooltip && this._tooltip.parentNode) {
        this._tooltip.parentNode.removeChild(this._tooltip);
      }

      this._tooltip = null;
      this._tooltipArrow = null;
    }

    _attachTooltipHandlers(actual, ref, varianceRaw, variancePct, semanticRule) {
      const marker = this.shadowRoot.querySelector(".marker-hit");

      if (!marker) return;

      const semanticIcon = this._getSemanticText(semanticRule);
      const semanticLabel = semanticRule && semanticRule.label
        ? this._escapeHtml(semanticRule.label)
        : "";

      const semanticRow = (this._state.showSemanticStatusInTooltip && (semanticIcon || semanticLabel)) ? `
          <div style="color:#d9d9d9;">Status</div>
          <div style="font-weight:700;text-align:right;color:${this._escapeHtml(semanticRule.tooltipTextColor || semanticRule.textColor || "#ffffff")};">
            ${semanticIcon}${semanticIcon && semanticLabel ? " " : ""}${semanticLabel}
          </div>
      ` : "";

      const html = `
        <div style="display:grid;grid-template-columns:auto auto;column-gap:20px;row-gap:4px;align-items:center;">
          <div style="color:#d9d9d9;">Actual</div>
          <div style="font-weight:700;text-align:right;color:${this._escapeHtml(semanticRule && semanticRule.textColor ? semanticRule.textColor : "#ffffff")};">
            ${this._formatTooltipActual(actual, semanticRule)}
          </div>
          <div style="color:#d9d9d9;">Reference</div>
          <div style="font-weight:700;text-align:right;">${this._escapeHtml(this._formatNumber(ref, this._state.rawDecimals))}</div>
          <div style="color:#d9d9d9;">Variance</div>
          <div style="font-weight:700;text-align:right;">${this._escapeHtml(this._formatVariance(varianceRaw, variancePct))}</div>
          ${semanticRow}
        </div>
      `;

      marker.addEventListener("mouseenter", () => {
        this._showTooltip(marker.getBoundingClientRect(), html);
      });

      marker.addEventListener("mousemove", () => {
        this._showTooltip(marker.getBoundingClientRect(), html);
      });

      marker.addEventListener("mouseleave", () => {
        this._hideTooltip();
      });
    }

    render() {
      if (!this.isConnected || !this._root) return;

      const s = this._state;

      this._root.style.setProperty("--kpb-font-family", s.fontFamily);
      this._root.style.setProperty("--kpb-font-weight", s.fontWeight);
      this._root.style.setProperty("--kpb-font-style", s.fontStyle);
      this._root.style.setProperty("--kpb-text-color", s.textColor);

      const breakdownItems = this._getDimensionBreakdownItems();
      if (breakdownItems.length) {
        this._renderDimensionBreakdown(breakdownItems);
        return;
      }

      const actual = Number(s.actualValue);
      const ref = Number(s.referenceValue);
      const lowerPct = Number(s.lowerBoundZonePercentage);
      const targetPct = Number(s.targetZonePercentage);
      const upperPct = Number(s.upperBoundZonePercentage);
      const pctSum = lowerPct + targetPct + upperPct;

      if (![actual, ref, lowerPct, targetPct, upperPct].every(Number.isFinite) || ref === 0) {
        this._root.innerHTML = `<div class="error">Invalid data: actualValue/referenceValue and zone percentages must be numeric; referenceValue must not be 0.</div>`;
        return;
      }

      if (Math.round(pctSum * 1000) / 1000 !== 100) {
        this._root.innerHTML = `<div class="error">Invalid configuration: zone percentages must equal 100. Current sum: ${pctSum}.</div>`;
        return;
      }

      const lowerSize = ref * lowerPct / 100;
      const targetSize = ref * targetPct / 100;
      const upperSize = ref * upperPct / 100;

      const axisMin = ref - lowerSize;
      const targetEnd = ref + targetSize;
      const axisMax = targetEnd + upperSize;
      const axisRange = axisMax - axisMin;

      if (!Number.isFinite(axisRange) || axisRange <= 0) {
        this._root.innerHTML = `<div class="error">Invalid range calculated from referenceValue and zones.</div>`;
        return;
      }

      const width = Math.max(this.clientWidth || 320, 160);
      const height = Math.max(this.clientHeight || 120, 90);

      const adaptiveLayout = Boolean(s.adaptiveLayout);
      const isCompactHeight = adaptiveLayout && height < Number(s.compactHeightThreshold);
      const isMinimalHeight = adaptiveLayout && height < Number(s.minimalHeightThreshold);

      const effectiveVarianceOnHover = isCompactHeight && s.hideVarianceWhenCompact ? false : s.varianceOnHover;
      const effectiveShowVarianceIndicator = isCompactHeight && s.hideVarianceWhenCompact ? false : s.showVarianceIndicator;
      const effectiveReferenceLineOnHover = isCompactHeight && s.hideReferenceLineWhenCompact ? false : s.referenceLineOnHover;
      const effectiveShowReferenceLine = isCompactHeight && s.hideReferenceLineWhenCompact ? false : s.showReferenceLine;
      const effectiveShowMarkerLabel = isMinimalHeight && s.hideMarkerLabelWhenMinimal ? false : s.showMarkerLabel;

      const margin = {
        left: Math.max(0, Number(s.paddingLeft)),
        right: Math.max(0, Number(s.paddingRight)),
        top: Math.max(0, Number(s.paddingTop)),
        bottom: s.showAxisLabels
          ? Math.max(Number(s.paddingBottom), Math.max(30, Number(s.axisFontSize) + 22))
          : Math.max(0, Number(s.paddingBottom))
      };

      const plotX = margin.left;
      const plotW = Math.max(width - margin.left - margin.right, 80);

      const scaleFactor = s.responsiveScaling
        ? Math.max(0.75, Math.min(1.6, height / 120))
        : 1;

      const barH = Math.max(2, Number(s.barHeight) * scaleFactor);
      const markerWidth = Math.max(1, Number(s.markerWidth) * scaleFactor);
      const markerRadius = Math.max(1, Number(s.markerRadius) * scaleFactor);
      const referenceLineWidth = Math.max(1, Number(s.referenceLineWidth) * scaleFactor);
      const varianceLineWidth = Math.max(0.5, Number(s.varianceLineWidth) * scaleFactor);
      const labelFont = Math.max(6, Number(s.axisFontSize || s.fontSize) * scaleFactor);
      const valueFont = Math.max(6, Number(s.markerFontSize || s.fontSize) * scaleFactor);

      let barY = Math.max(margin.top + 8, height * 0.38);
      const axisLabelY = height - 8;
      const markerExtension = Math.max(6, barH * 0.45);
      const varianceVerticalOffset = Math.max(18, barH * 1.35);
      const markerLabelAutoGap = Math.max(
        10,
        markerRadius + markerWidth + 2,
        Math.round(barH * 0.35),
        Math.round(valueFont * 0.75)
      );

      /*
       * Auto layout:
       * - keep enough top space for hover variance
       * - keep enough bottom space for marker label
       * - never solve bottom overlap by pushing the variance outside the widget
       */
      const needsVarianceTopSpace = Boolean(effectiveShowVarianceIndicator || effectiveVarianceOnHover);
      const minBarY = margin.top + (
        needsVarianceTopSpace
          ? varianceVerticalOffset + Math.max(6, markerRadius)
          : Math.max(6, markerRadius + markerWidth)
      );

      if (barY < minBarY) {
        barY = minBarY;
      }

      let markerTop = barY - markerExtension;
      let markerBottom = barY + barH + markerExtension;
      let markerLabelCandidateY = markerBottom + markerLabelAutoGap + valueFont;
      const markerLabelMaxY = s.showAxisLabels
        ? axisLabelY - Math.max(14, valueFont + 5)
        : height - 8;

      if (markerLabelCandidateY > markerLabelMaxY && barY > minBarY) {
        const requiredShift = markerLabelCandidateY - markerLabelMaxY;
        const availableShift = barY - minBarY;
        const shiftUp = Math.min(requiredShift, availableShift);
        barY -= shiftUp;
        markerTop = barY - markerExtension;
        markerBottom = barY + barH + markerExtension;
        markerLabelCandidateY = markerBottom + markerLabelAutoGap + valueFont;
      }

      const varianceY = Math.max(margin.top + 2, barY - varianceVerticalOffset);
      const markerLabelY = Math.min(markerLabelMaxY, markerLabelCandidateY);

      const scale = (value) => plotX + ((value - axisMin) / axisRange) * plotW;
      const clamp = (x) => Math.max(plotX, Math.min(plotX + plotW, x));

      const xMin = scale(axisMin);
      const xRef = scale(ref);
      const xTargetEnd = scale(targetEnd);
      const xMax = scale(axisMax);
      const rawActualX = scale(actual);
      const xActual = s.clampMarker ? clamp(rawActualX) : rawActualX;

      const varianceRaw = actual - ref;
      const variancePct = ref !== 0 ? varianceRaw / ref : null;

      const semanticContext = {
        actual,
        reference: ref,
        varianceRaw,
        variancePct
      };
      const semanticRule = this._getSemanticRule(semanticContext);
      const effectiveMarkerColor = s.markerColor;
      const effectiveTextColor = semanticRule && semanticRule.textColor ? semanticRule.textColor : s.markerColor;
      const effectiveFontWeight = semanticRule && semanticRule.fontWeight ? semanticRule.fontWeight : s.fontWeight;
      const effectiveFontStyle = semanticRule && semanticRule.fontStyle ? semanticRule.fontStyle : s.fontStyle;
      const semanticBackgroundColor = semanticRule && semanticRule.backgroundColor ? semanticRule.backgroundColor : "transparent";

      this._root.style.backgroundColor = semanticBackgroundColor;

      const arrowDir = actual >= ref ? 1 : -1;
      const arrowStartX = arrowDir > 0 ? xRef : xActual;
      const arrowEndX = arrowDir > 0 ? xActual : xRef;
      const arrowLength = Math.abs(arrowEndX - arrowStartX);

      const showArrow = (effectiveShowVarianceIndicator || effectiveVarianceOnHover) && arrowLength > 4;
      const varianceLayerClass = effectiveShowVarianceIndicator ? "variance-layer always-visible" : "variance-layer";
      const dashArray = s.varianceLineStyle === "dashed" ? "3 3" : "";

      const showReferenceLine = effectiveShowReferenceLine || effectiveReferenceLineOnHover;
      const referenceLineClass = effectiveShowReferenceLine ? "reference-line-layer always-visible" : "reference-line-layer";

      const outsideLeft = actual < axisMin;
      const outsideRight = actual > axisMax;
      const outsideHint = outsideLeft ? "◀" : outsideRight ? "▶" : "";

      this._root.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="KPI Pipeline Bullet">
          <defs>
            <marker id="pb-arrow-head" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 Z" fill="${s.varianceColor}"></path>
            </marker>
          </defs>

          <rect x="${xMin}" y="${barY}" width="${xRef - xMin}" height="${barH}" fill="${s.lowerBoundZoneColor}" rx="2"></rect>
          <rect x="${xRef}" y="${barY}" width="${xTargetEnd - xRef}" height="${barH}" fill="${s.targetZoneColor}"></rect>
          <rect x="${xTargetEnd}" y="${barY}" width="${xMax - xTargetEnd}" height="${barH}" fill="${s.upperBoundZoneColor}" rx="2"></rect>

          ${showReferenceLine ? `
            <g class="${referenceLineClass}">
              <line x1="${xRef}" y1="${barY - 7}" x2="${xRef}" y2="${barY + barH + 7}"
                    stroke="${s.referenceLineColor}" stroke-width="${referenceLineWidth}"></line>
            </g>
          ` : ""}

          ${showArrow ? `
            <g class="${varianceLayerClass}">
              <line x1="${xActual}" y1="${barY - 7}" x2="${xActual}" y2="${varianceY + 5}"
                    stroke="${s.varianceColor}" stroke-width="${varianceLineWidth}" stroke-dasharray="${dashArray}"></line>

              <line x1="${xRef}" y1="${barY - 7}" x2="${xRef}" y2="${varianceY + 5}"
                    stroke="${s.varianceColor}" stroke-width="${varianceLineWidth}" stroke-dasharray="${dashArray}"></line>

              <line x1="${arrowStartX}" y1="${varianceY}"
                    x2="${arrowEndX}" y2="${varianceY}"
                    stroke="${s.varianceColor}" stroke-width="${varianceLineWidth}"
                    stroke-dasharray="${dashArray}"
                    marker-end="url(#pb-arrow-head)"></line>
            </g>
          ` : ""}

          <line x1="${xActual}" y1="${markerTop}" x2="${xActual}" y2="${markerBottom}" stroke="${effectiveMarkerColor}" stroke-width="${markerWidth}"></line>
          <circle cx="${xActual}" cy="${markerTop}" r="${Math.max(markerRadius + 2, 6)}" fill="${effectiveMarkerColor}" class="marker-hit"></circle>

          ${outsideHint ? `
            <text x="${xActual}" y="${markerBottom + 14}" text-anchor="middle" font-size="${valueFont}" fill="${effectiveTextColor}">
              ${outsideHint}
            </text>
          ` : ""}

          ${(s.showLabels && effectiveShowMarkerLabel) ? `
            <text x="${xActual}" y="${markerLabelY}"
                  text-anchor="middle"
                  font-size="${valueFont}"
                  fill="${s.markerColor}">
              ${this._formatMarkerLabel(actual, semanticRule)}
            </text>
          ` : ""}

          ${s.showAxisLabels ? `
            <text x="${xMin}" y="${axisLabelY}" text-anchor="middle" font-size="${labelFont}" class="muted">${this._formatNumber(axisMin, s.rawDecimals)}</text>
            <text x="${xRef}" y="${axisLabelY}" text-anchor="middle" font-size="${labelFont}" class="muted">${this._formatNumber(ref, s.rawDecimals)}</text>
            <text x="${xTargetEnd}" y="${axisLabelY}" text-anchor="middle" font-size="${labelFont}" class="muted">${this._formatNumber(targetEnd, s.rawDecimals)}</text>
            <text x="${xMax}" y="${axisLabelY}" text-anchor="middle" font-size="${labelFont}" class="muted">${this._formatNumber(axisMax, s.rawDecimals)}</text>
          ` : ""}
        </svg>
      `;

      this._attachTooltipHandlers(actual, ref, varianceRaw, variancePct, semanticRule);
    }
  }

  if (!customElements.get("kpi-pipeline-bullet")) {
    customElements.define("kpi-pipeline-bullet", KpiPipelineBullet);
  }
})();
