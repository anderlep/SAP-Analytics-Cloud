(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: "72", Arial, Helvetica, sans-serif;
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
        font-family: "72", Arial, Helvetica, sans-serif;
        fill: var(--kpb-text-color, #32363a);
      }
      .muted {
        fill: #6a6d70;
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
        showReferenceLine: true,

        showVarianceIndicator: false,
        varianceOnHover: true,
        varianceLineStyle: "dashed",
        varianceDisplayMode: "both",
        varianceSeparator: " | ",

        rawDecimals: 0,
        percentDecimals: 1,
        unit: "",
        clampMarker: true
      };
    }

    static get observedAttributes() {
      return [
        "actual-value", "reference-value",
        "lower-bound-zone-percentage", "target-zone-percentage", "upper-bound-zone-percentage",
        "lower-bound-zone-color", "target-zone-color", "upper-bound-zone-color",
        "marker-color", "reference-line-color", "variance-color",
        "show-labels", "show-marker-label", "show-axis-labels", "show-reference-line",
        "show-variance-indicator", "variance-on-hover", "variance-line-style",
        "variance-display-mode", "variance-separator",
        "raw-decimals", "percent-decimals", "unit", "clamp-marker"
      ];
    }

    connectedCallback() {
      this._upgradeProperties(Object.keys(this._state));
      this._resizeObserver = new ResizeObserver(() => this.render());
      this._resizeObserver.observe(this);
      this.render();
    }

    disconnectedCallback() {
      if (this._resizeObserver) this._resizeObserver.disconnect();
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
      if (value === null || value === undefined) return this._state[prop];

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

    get rawDecimals() { return this._state.rawDecimals; }
    set rawDecimals(v) { this._set("rawDecimals", v); }

    get percentDecimals() { return this._state.percentDecimals; }
    set percentDecimals(v) { this._set("percentDecimals", v); }

    get unit() { return this._state.unit; }
    set unit(v) { this._set("unit", v); }

    get clampMarker() { return this._state.clampMarker; }
    set clampMarker(v) { this._set("clampMarker", v); }

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
      if (markerColor !== undefined) this._state.markerColor = String(markerColor);
      this.render();
    }

    setVarianceDisplayMode(mode) {
      const allowed = ["both", "raw", "percent", "none"];
      this._state.varianceDisplayMode = allowed.includes(mode) ? mode : "both";
      this.render();
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

    render() {
      if (!this.isConnected || !this._root) return;

      const s = this._state;
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
      const targetStart = ref;
      const targetEnd = ref + targetSize;
      const axisMax = targetEnd + upperSize;
      const axisRange = axisMax - axisMin;

      if (!Number.isFinite(axisRange) || axisRange <= 0) {
        this._root.innerHTML = `<div class="error">Invalid range calculated from referenceValue and zones.</div>`;
        return;
      }

      const width = Math.max(this.clientWidth || 320, 160);
      const height = Math.max(this.clientHeight || 120, 90);

      const margin = {
        left: 28,
        right: 28,
        top: 34,
        bottom: s.showAxisLabels ? 46 : 24
      };

      const plotX = margin.left;
      const plotW = Math.max(width - margin.left - margin.right, 80);

      const barY = Math.max(42, height * 0.38);
      const barH = Math.min(24, Math.max(14, height * 0.16));
      const varianceY = barY - 24;
      const axisLabelY = height - 8;
      const markerTop = barY - 10;
      const markerBottom = barY + barH + 10;
      const markerLabelY = s.showAxisLabels
        ? Math.min(axisLabelY - 18, markerBottom + 18)
        : Math.min(height - 8, markerBottom + 18);

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
      const varianceLabel = this._formatVariance(varianceRaw, variancePct);

      const arrowDir = actual >= ref ? 1 : -1;
      const arrowStartX = arrowDir > 0 ? xRef : xActual;
      const arrowEndX = arrowDir > 0 ? xActual : xRef;
      const arrowLength = Math.abs(arrowEndX - arrowStartX);

      const showArrow = (s.showVarianceIndicator || s.varianceOnHover) && arrowLength > 4;
      const varianceLayerClass = s.showVarianceIndicator ? "variance-layer always-visible" : "variance-layer";
      const dashArray = s.varianceLineStyle === "dashed" ? "3 3" : "";

      const labelFont = Math.max(10, Math.min(13, height * 0.1));
      const valueFont = Math.max(11, Math.min(15, height * 0.12));

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

          ${s.showReferenceLine ? `
            <line x1="${xRef}" y1="${barY - 7}" x2="${xRef}" y2="${barY + barH + 7}" stroke="${s.referenceLineColor}" stroke-width="2"></line>
          ` : ""}

          ${showArrow ? `
            <g class="${varianceLayerClass}">
              <line x1="${xActual}" y1="${barY - 7}" x2="${xActual}" y2="${varianceY + 5}"
                    stroke="${s.varianceColor}" stroke-width="1" stroke-dasharray="${dashArray}"></line>

              <line x1="${xRef}" y1="${barY - 7}" x2="${xRef}" y2="${varianceY + 5}"
                    stroke="${s.varianceColor}" stroke-width="1" stroke-dasharray="${dashArray}"></line>

              <line x1="${arrowStartX}" y1="${varianceY}"
                    x2="${arrowEndX}" y2="${varianceY}"
                    stroke="${s.varianceColor}" stroke-width="1.2"
                    stroke-dasharray="${dashArray}"
                    marker-end="url(#pb-arrow-head)"></line>

              ${varianceLabel ? `
                <text x="${xActual}" y="${varianceY - 6}"
                      text-anchor="middle"
                      font-size="${labelFont}"
                      class="muted">${varianceLabel}</text>
              ` : ""}
            </g>
          ` : ""}

          <line x1="${xActual}" y1="${markerTop}" x2="${xActual}" y2="${markerBottom}" stroke="${s.markerColor}" stroke-width="3"></line>
          <circle cx="${xActual}" cy="${markerTop}" r="4" fill="${s.markerColor}"></circle>

          ${outsideHint ? `
            <text x="${xActual}" y="${markerBottom + 14}" text-anchor="middle" font-size="${valueFont}" fill="${s.markerColor}">
              ${outsideHint}
            </text>
          ` : ""}

          ${(s.showLabels && s.showMarkerLabel) ? `
            <text x="${xActual}" y="${markerLabelY}"
                  text-anchor="middle"
                  font-size="${valueFont}"
                  fill="${s.markerColor}">
              ${this._formatNumber(actual, s.rawDecimals)}
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
    }
  }

  customElements.define("kpi-pipeline-bullet", KpiPipelineBullet);
})();