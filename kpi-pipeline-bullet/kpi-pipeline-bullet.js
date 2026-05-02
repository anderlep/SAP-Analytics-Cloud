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


      .breakdown-list {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: auto;
      }

      .breakdown-item {
        box-sizing: border-box;
        flex: 0 0 auto;
        min-width: 0;
      }

      .breakdown-item-inner {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        min-width: 0;
      }

      .breakdown-item-inner.top {
        flex-direction: column;
      }

      .breakdown-item-inner.left {
        flex-direction: row;
        align-items: center;
      }

      .breakdown-label {
        box-sizing: border-box;
        color: var(--kpb-text-color, #32363a);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--kpb-font-family, "72", Arial, Helvetica, sans-serif);
        font-weight: var(--kpb-font-weight, normal);
        font-style: var(--kpb-font-style, normal);
      }

      .breakdown-label.top {
        width: 100%;
        padding: 0 4px 2px 4px;
      }

      .breakdown-label.left {
        width: 30%;
        min-width: 80px;
        max-width: 180px;
        padding: 0 8px 0 0;
      }

      .breakdown-bullet-host {
        box-sizing: border-box;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
      }

      .breakdown-bullet {
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
      this._dataItems = null;
      this._dataMeta = null;

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


        dimensionBreakdownEnabled: false,
        maxBreakdownItems: 50,
        breakdownItemHeight: 78,
        breakdownItemGap: 8,
        showDimensionLabel: true,
        dimensionLabelPosition: "top",
        dimensionLabelFontSize: 12,
        dimensionLabelColor: "",
        dimensionId: "",
        actualMeasureId: "",
        referenceMeasureId: "",
        resultSetFilters: [],

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
        "max-breakdown-items",
        "breakdown-item-height",
        "breakdown-item-gap",
        "show-dimension-label",
        "dimension-label-position",
        "dimension-label-font-size",
        "dimension-label-color",
        "dimension-id",
        "actual-measure-id",
        "reference-measure-id",
        "result-set-filters",
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

    get dimensionLabelFontSize() { return this._state.dimensionLabelFontSize; }
    set dimensionLabelFontSize(v) { this._set("dimensionLabelFontSize", v); }

    get dimensionLabelColor() { return this._state.dimensionLabelColor; }
    set dimensionLabelColor(v) { this._set("dimensionLabelColor", v); }

    get dimensionId() { return this._state.dimensionId; }
    set dimensionId(v) { this._set("dimensionId", v); }

    get actualMeasureId() { return this._state.actualMeasureId; }
    set actualMeasureId(v) { this._set("actualMeasureId", v); }

    get referenceMeasureId() { return this._state.referenceMeasureId; }
    set referenceMeasureId(v) { this._set("referenceMeasureId", v); }

    get resultSetFilters() { return this._state.resultSetFilters; }
    set resultSetFilters(v) { this._set("resultSetFilters", v); }

    setData(actualValue, referenceValue) {
      this._dataItems = null;
      this._dataMeta = null;
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



    _parseJsonInput(input, fallback) {
      if (input === null || input === undefined || input === "") {
        return fallback;
      }

      if (typeof input === "string") {
        try {
          return JSON.parse(input);
        } catch (e) {
          console.error("Invalid JSON input", e);
          return fallback;
        }
      }

      return input;
    }

    setDimensionBreakdownEnabled(enabled) {
      this._state.dimensionBreakdownEnabled = enabled === true || enabled === "true";
      this.render();
    }

    setDimensionBinding(dimensionId, actualMeasureId, referenceMeasureId) {
      this._state.dimensionId = dimensionId === undefined || dimensionId === null ? "" : String(dimensionId);
      this._state.actualMeasureId = actualMeasureId === undefined || actualMeasureId === null ? "" : String(actualMeasureId);
      this._state.referenceMeasureId = referenceMeasureId === undefined || referenceMeasureId === null ? "" : String(referenceMeasureId);
      this.render();
    }

    setDataJson(dataJson) {
      const payload = this._parseJsonInput(dataJson, null);

      if (!payload) {
        this._root.innerHTML = '<div class="error">Invalid data JSON.</div>';
        return;
      }

      if (!Array.isArray(payload) && (payload.actualValue !== undefined || payload.actual !== undefined) && (payload.referenceValue !== undefined || payload.reference !== undefined)) {
        this._dataItems = null;
        this._dataMeta = null;
        this._state.dimensionBreakdownEnabled = payload.dimensionBreakdownEnabled === true;
        this._state.actualValue = this._toNumber(payload.actualValue !== undefined ? payload.actualValue : payload.actual);
        this._state.referenceValue = this._toNumber(payload.referenceValue !== undefined ? payload.referenceValue : payload.reference);
        this.render();
        return;
      }

      const mapping = Array.isArray(payload)
        ? {}
        : {
            dimensionId: payload.dimensionId || payload.dimension || this._state.dimensionId,
            actualMeasureId: payload.actualMeasureId || payload.actualMeasure || this._state.actualMeasureId,
            referenceMeasureId: payload.referenceMeasureId || payload.referenceMeasure || this._state.referenceMeasureId,
            filters: payload.filters || payload.resultSetFilters || this._state.resultSetFilters
          };

      const normalized = Array.isArray(payload)
        ? this._normalizeResultSet(payload, mapping)
        : (Array.isArray(payload.items)
            ? this._normalizeItems(payload.items, mapping)
            : this._normalizeResultSet(payload.rows || payload.data || [], mapping));

      if (!normalized.items.length) {
        this._root.innerHTML = '<div class="error">No valid data in data JSON.</div>';
        return;
      }

      this._dataItems = normalized.items;
      this._dataMeta = normalized.meta;

      if (!Array.isArray(payload) && payload.dimensionBreakdownEnabled !== undefined) {
        this._state.dimensionBreakdownEnabled = payload.dimensionBreakdownEnabled === true || payload.dimensionBreakdownEnabled === "true";
      } else {
        this._state.dimensionBreakdownEnabled = true;
      }

      this.render();
    }

    setResultSet(resultSetJson, mappingJson) {
      const resultSet = this._parseJsonInput(resultSetJson, null);
      const mapping = this._parseJsonInput(mappingJson, {}) || {};

      if (!Array.isArray(resultSet)) {
        this._root.innerHTML = '<div class="error">Invalid result set JSON: expected array.</div>';
        return;
      }

      Object.keys(mapping).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(this._state, key)) {
          this._state[key] = this._parseValue(key, mapping[key]);
        }
      });

      const normalized = this._normalizeResultSet(resultSet, {
        dimensionId: mapping.dimensionId || this._state.dimensionId,
        actualMeasureId: mapping.actualMeasureId || this._state.actualMeasureId,
        referenceMeasureId: mapping.referenceMeasureId || this._state.referenceMeasureId,
        filters: mapping.filters || mapping.resultSetFilters || this._state.resultSetFilters
      });

      if (!normalized.items.length) {
        this._root.innerHTML = '<div class="error">No valid data in result set.</div>';
        return;
      }

      this._dataItems = normalized.items;
      this._dataMeta = normalized.meta;

      if (mapping.dimensionBreakdownEnabled !== undefined) {
        this._state.dimensionBreakdownEnabled = mapping.dimensionBreakdownEnabled === true || mapping.dimensionBreakdownEnabled === "true";
      } else {
        this._state.dimensionBreakdownEnabled = true;
      }

      this.render();
    }

    _normalizeItems(items, mapping) {
      const normalizedItems = [];

      items.forEach((item, index) => {
        if (!item || typeof item !== "object") return;

        const actualKey = mapping.actualMeasureId || "actualValue";
        const referenceKey = mapping.referenceMeasureId || "referenceValue";

        const actual = this._toNumber(
          item.actualValue !== undefined ? item.actualValue :
          item.actual !== undefined ? item.actual :
          item[actualKey]
        );
        const reference = this._toNumber(
          item.referenceValue !== undefined ? item.referenceValue :
          item.reference !== undefined ? item.reference :
          item[referenceKey]
        );

        if (!Number.isFinite(actual) || !Number.isFinite(reference)) return;

        const id = item.id !== undefined ? String(item.id) : String(index + 1);
        const label = item.label !== undefined
          ? String(item.label)
          : item.description !== undefined
            ? String(item.description)
            : id;

        normalizedItems.push({
          id,
          label,
          actualValue: actual,
          referenceValue: reference
        });
      });

      return {
        items: normalizedItems,
        meta: {
          dimensionId: mapping.dimensionId || "",
          actualMeasureId: mapping.actualMeasureId || "actualValue",
          referenceMeasureId: mapping.referenceMeasureId || "referenceValue"
        }
      };
    }

    _normalizeResultSet(rows, mapping) {
      const filteredRows = rows.filter((row) => this._matchesResultSetFilters(row, mapping.filters || []));
      if (!filteredRows.length) {
        return { items: [], meta: {} };
      }

      const dimensionId = mapping.dimensionId || this._state.dimensionId || this._discoverFirstDimensionId(filteredRows);
      if (!dimensionId) {
        return { items: [], meta: {} };
      }

      const hasMeasureDimension = filteredRows.some((row) => row && row["@MeasureDimension"]);
      const measureKeys = this._discoverMeasureKeys(filteredRows, dimensionId);

      if (hasMeasureDimension && measureKeys.length < 2) {
        return this._normalizeLongResultSet(filteredRows, mapping, dimensionId);
      }

      return this._normalizeWideResultSet(filteredRows, mapping, dimensionId, measureKeys);
    }

    _normalizeWideResultSet(rows, mapping, dimensionId, discoveredMeasureKeys) {
      const measureKeys = discoveredMeasureKeys.length ? discoveredMeasureKeys : this._discoverMeasureKeys(rows, dimensionId);
      const actualMeasureId = mapping.actualMeasureId || this._state.actualMeasureId || measureKeys[0] || "";
      const referenceMeasureId = mapping.referenceMeasureId || this._state.referenceMeasureId || measureKeys[1] || "";

      if (!actualMeasureId || !referenceMeasureId) {
        return { items: [], meta: { dimensionId, actualMeasureId, referenceMeasureId } };
      }

      const groups = new Map();

      rows.forEach((row) => {
        const member = this._getMember(row, dimensionId);
        const actual = this._toNumber(this._getCell(row, actualMeasureId));
        const reference = this._toNumber(this._getCell(row, referenceMeasureId));

        if (!member || !Number.isFinite(actual) || !Number.isFinite(reference)) return;

        if (!groups.has(member.id)) {
          groups.set(member.id, {
            id: member.id,
            label: member.label,
            actualValue: 0,
            referenceValue: 0
          });
        }

        const target = groups.get(member.id);
        target.actualValue += actual;
        target.referenceValue += reference;
      });

      return {
        items: Array.from(groups.values()),
        meta: { dimensionId, actualMeasureId, referenceMeasureId }
      };
    }

    _normalizeLongResultSet(rows, mapping, dimensionId) {
      const measureMembers = [];
      const seenMeasures = new Set();

      rows.forEach((row) => {
        const measure = this._getMember(row, "@MeasureDimension");
        if (measure && !seenMeasures.has(measure.id)) {
          seenMeasures.add(measure.id);
          measureMembers.push(measure.id);
        }
      });

      const actualMeasureId = mapping.actualMeasureId || this._state.actualMeasureId || measureMembers[0] || "";
      const referenceMeasureId = mapping.referenceMeasureId || this._state.referenceMeasureId || measureMembers[1] || "";

      if (!actualMeasureId || !referenceMeasureId) {
        return { items: [], meta: { dimensionId, actualMeasureId, referenceMeasureId } };
      }

      const groups = new Map();

      rows.forEach((row) => {
        const member = this._getMember(row, dimensionId);
        const measure = this._getMember(row, "@MeasureDimension");
        if (!member || !measure) return;

        const value = this._extractLongMeasureValue(row, actualMeasureId, referenceMeasureId);
        if (!Number.isFinite(value)) return;

        if (!groups.has(member.id)) {
          groups.set(member.id, {
            id: member.id,
            label: member.label,
            actualValue: 0,
            referenceValue: 0,
            _hasActual: false,
            _hasReference: false
          });
        }

        const target = groups.get(member.id);

        if (measure.id === actualMeasureId || measure.label === actualMeasureId) {
          target.actualValue += value;
          target._hasActual = true;
        }

        if (measure.id === referenceMeasureId || measure.label === referenceMeasureId) {
          target.referenceValue += value;
          target._hasReference = true;
        }
      });

      const items = Array.from(groups.values())
        .filter((item) => item._hasActual && item._hasReference)
        .map((item) => ({
          id: item.id,
          label: item.label,
          actualValue: item.actualValue,
          referenceValue: item.referenceValue
        }));

      return {
        items,
        meta: { dimensionId, actualMeasureId, referenceMeasureId }
      };
    }

    _discoverFirstDimensionId(rows) {
      for (let r = 0; r < rows.length; r += 1) {
        const row = rows[r];
        if (!row || typeof row !== "object") continue;

        const keys = Object.keys(row);
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          if (key === "@MeasureDimension" || key === "rawValue" || key === "formattedValue" || key === "value") continue;

          const cell = row[key];

          if (this._isDimensionCell(cell)) {
            return key;
          }
        }

        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          if (key === "@MeasureDimension" || key === "rawValue" || key === "formattedValue" || key === "value") continue;

          const cell = row[key];
          if (!this._isMeasureCell(cell) && !Number.isFinite(this._toNumber(cell))) {
            return key;
          }
        }
      }

      return "";
    }

    _discoverMeasureKeys(rows, dimensionId) {
      const keys = [];
      const seen = new Set();

      rows.forEach((row) => {
        if (!row || typeof row !== "object") return;

        Object.keys(row).forEach((key) => {
          if (seen.has(key)) return;
          if (key === dimensionId || key === "@MeasureDimension" || key === "rawValue" || key === "formattedValue" || key === "value") return;

          const cell = row[key];

          if (this._isMeasureCell(cell) || Number.isFinite(this._toNumber(cell))) {
            seen.add(key);
            keys.push(key);
          }
        });
      });

      return keys;
    }

    _matchesResultSetFilters(row, filters) {
      if (!Array.isArray(filters) || !filters.length) return true;

      return filters.every((filter) => {
        if (!filter || !filter.dimensionId) return true;

        const allowed = Array.isArray(filter.members)
          ? filter.members.map((member) => String(member))
          : filter.member !== undefined
            ? [String(filter.member)]
            : [];

        if (!allowed.length) return true;

        const member = this._getMember(row, filter.dimensionId);
        if (!member) return false;

        return allowed.includes(member.id) || allowed.includes(member.label);
      });
    }

    _getCell(row, key) {
      if (!row || !key) return undefined;
      return row[key];
    }

    _getMember(row, key) {
      if (!row || !key || row[key] === undefined || row[key] === null) return null;

      const cell = row[key];

      if (typeof cell === "object") {
        const id = cell.id !== undefined
          ? String(cell.id)
          : cell.key !== undefined
            ? String(cell.key)
            : cell.rawValue !== undefined
              ? String(cell.rawValue)
              : cell.value !== undefined
                ? String(cell.value)
                : "";

        const label = cell.description !== undefined
          ? String(cell.description)
          : cell.label !== undefined
            ? String(cell.label)
            : cell.formattedValue !== undefined
              ? String(cell.formattedValue)
              : id;

        return id ? { id, label: label || id } : null;
      }

      return {
        id: String(cell),
        label: String(cell)
      };
    }

    _isDimensionCell(cell) {
      return Boolean(
        cell &&
        typeof cell === "object" &&
        !this._isMeasureCell(cell) &&
        (cell.id !== undefined || cell.description !== undefined || cell.label !== undefined || cell.key !== undefined)
      );
    }

    _isMeasureCell(cell) {
      return Boolean(
        cell &&
        typeof cell === "object" &&
        (cell.rawValue !== undefined || cell.formattedValue !== undefined || cell.value !== undefined) &&
        !(cell.id !== undefined && cell.description !== undefined && cell.rawValue === undefined)
      );
    }

    _extractLongMeasureValue(row, actualMeasureId, referenceMeasureId) {
      if (row.rawValue !== undefined) return this._toNumber(row.rawValue);
      if (row.value !== undefined) return this._toNumber(row.value);

      if (row[actualMeasureId] !== undefined) return this._toNumber(row[actualMeasureId]);
      if (row[referenceMeasureId] !== undefined) return this._toNumber(row[referenceMeasureId]);

      const keys = Object.keys(row || {});
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (key === "@MeasureDimension") continue;

        const cell = row[key];
        if (this._isMeasureCell(cell)) {
          const n = this._toNumber(cell);
          if (Number.isFinite(n)) return n;
        }
      }

      return NaN;
    }

    _toNumber(value) {
      if (value && typeof value === "object") {
        if (value.rawValue !== undefined) return this._toNumber(value.rawValue);
        if (value.value !== undefined) return this._toNumber(value.value);
        if (value.formattedValue !== undefined) return this._toNumber(value.formattedValue);
      }

      if (typeof value === "number") return value;

      if (typeof value === "string") {
        const normalized = value
          .replace(/\s/g, "")
          .replace(/%$/g, "")
          .replace(/,/g, ".");

        const n = Number(normalized);
        return Number.isFinite(n) ? n : NaN;
      }

      const n = Number(value);
      return Number.isFinite(n) ? n : NaN;
    }

    _renderBreakdown() {
      const s = this._state;
      const maxItems = Math.max(1, Math.floor(Number(s.maxBreakdownItems) || 50));
      const items = (Array.isArray(this._dataItems) ? this._dataItems : []).slice(0, maxItems);
      const itemHeight = Math.max(42, Number(s.breakdownItemHeight) || 78);
      const gap = Math.max(0, Number(s.breakdownItemGap) || 0);
      const labelPosition = String(s.dimensionLabelPosition || "top").toLowerCase() === "left" ? "left" : "top";
      const labelFontSize = Math.max(8, Number(s.dimensionLabelFontSize || s.fontSize || 12));
      const labelColor = s.dimensionLabelColor || s.textColor;

      if (!items.length) {
        this._root.innerHTML = '<div class="error">No breakdown data.</div>';
        return;
      }

      this._root.innerHTML = `
        <div class="breakdown-list">
          ${items.map((item, index) => `
            <div class="breakdown-item" style="height:${itemHeight}px;margin-bottom:${index === items.length - 1 ? 0 : gap}px;">
              <div class="breakdown-item-inner ${labelPosition}">
                ${s.showDimensionLabel ? `
                  <div class="breakdown-label ${labelPosition}"
                       title="${this._escapeHtml(item.label)}"
                       style="font-size:${labelFontSize}px;color:${this._escapeHtml(labelColor)};">
                    ${this._escapeHtml(item.label)}
                  </div>
                ` : ""}
                <div class="breakdown-bullet-host">
                  <kpi-pipeline-bullet class="breakdown-bullet" data-kpb-child="true"></kpi-pipeline-bullet>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      const childConfig = Object.assign({}, s, {
        dimensionBreakdownEnabled: false
      });

      const children = this.shadowRoot.querySelectorAll('kpi-pipeline-bullet[data-kpb-child="true"]');
      children.forEach((child, index) => {
        const item = items[index];
        child.setConfig(childConfig);
        child.setData(item.actualValue, item.referenceValue);
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

      if (s.dimensionBreakdownEnabled && Array.isArray(this._dataItems) && this._dataItems.length > 0) {
        this._renderBreakdown();
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
