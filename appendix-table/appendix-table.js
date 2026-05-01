(function () {
  class AppendixTable extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      this._rows = "[]";
      this._columns = "";
      this._rules = "";
      this._customCss = "";
      this._config =
        '{"label":"Filter","op":"Operator","value":"Value","showOperator":true,"emptyText":"Nejsou dostupná žádná data."}';
      this._styleConfig =
        '{"template":"default","columnWidthMode":"auto","showTotal":false}';
    }

    connectedCallback() {
      this.render();
    }

    get rows() {
      return this._rows;
    }

    set rows(value) {
      this._rows = value || "[]";
      this.render();
    }

    get config() {
      return this._config;
    }

    set config(value) {
      this._config = value || this._config;
      this.render();
    }

    get columns() {
      return this._columns;
    }

    set columns(value) {
      this._columns = value || "";
      this.render();
    }

    get styleConfig() {
      return this._styleConfig;
    }

    set styleConfig(value) {
      this._styleConfig = value || "{}";
      this.render();
    }

    get customCss() {
      return this._customCss;
    }

    set customCss(value) {
      this._customCss = value || "";
      this.render();
    }

    get rules() {
      return this._rules;
    }

    set rules(value) {
      this._rules = value || "";
      this.render();
    }

    setRows(rows) {
      this._rows = rows || "[]";
      this.render();
    }

    setConfig(config) {
      this._config = config || this._config;
      this.render();
    }

    setColumns(columns) {
      this._columns = columns || "";
      this.render();
    }

    setStyleConfig(styleConfig) {
      this._styleConfig = styleConfig || "{}";
      this.render();
    }

    setCustomCss(customCss) {
      this._customCss = customCss || "";
      this.render();
    }

    setRules(rules) {
      this._rules = rules || "";
      this.render();
    }

    setData(data) {
      try {
        var parsed = JSON.parse(data || "{}");

        if (parsed.config !== undefined) {
          this._config = JSON.stringify(parsed.config);
        }

        if (parsed.columns !== undefined) {
          this._columns = JSON.stringify(parsed.columns);
        }

        if (parsed.styleConfig !== undefined) {
          this._styleConfig = JSON.stringify(parsed.styleConfig);
        }

        if (parsed.customCss !== undefined) {
          this._customCss = String(parsed.customCss || "");
        }

        if (parsed.rules !== undefined) {
          this._rules = JSON.stringify(parsed.rules);
        }

        if (parsed.rows !== undefined) {
          this._rows = JSON.stringify(parsed.rows);
        }
      } catch (e) {
        this._rows = "[]";
      }

      this.render();
    }

    clear() {
      this._rows = "[]";
      this.render();
    }

    _escapeHtml(value) {
      if (value === null || value === undefined) {
        return "";
      }

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    _safeCssValue(value, fallback) {
      if (value === null || value === undefined || value === "") {
        return fallback;
      }

      return String(value).replace(/[<>]/g, "");
    }

    _parseJsonArray(value) {
      try {
        var parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    _parseRows() {
      return this._parseJsonArray(this._rows);
    }

    _parseRules() {
      return this._parseJsonArray(this._rules);
    }

    _parseConfig() {
      try {
        var parsed = JSON.parse(this._config || "{}");

        return {
          label: parsed.label || "Filter",
          op: parsed.op || "Operator",
          value: parsed.value || "Value",
          showOperator: parsed.showOperator !== false,
          emptyText: parsed.emptyText || "Nejsou dostupná žádná data."
        };
      } catch (e) {
        return {
          label: "Filter",
          op: "Operator",
          value: "Value",
          showOperator: true,
          emptyText: "Nejsou dostupná žádná data."
        };
      }
    }

    _parseColumns(config) {
      try {
        var parsed = JSON.parse(this._columns || "[]");

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter(function (column) {
              return column && column.key;
            })
            .map(function (column) {
              return {
                key: column.key,
                title: column.title || column.key,
                width: column.width || "",
                className: column.className || "",
                total: column.total || "",
                format: column.format || ""
              };
            });
        }
      } catch (e) {}

      if (config.showOperator) {
        return [
          {
            key: "label",
            title: config.label,
            width: "35%",
            className: "label",
            total: "",
            format: ""
          },
          {
            key: "op",
            title: config.op,
            width: "15%",
            className: "operator",
            total: "",
            format: ""
          },
          {
            key: "value",
            title: config.value,
            width: "50%",
            className: "value",
            total: "",
            format: ""
          }
        ];
      }

      return [
        {
          key: "label",
          title: config.label,
          width: "40%",
          className: "label",
          total: "",
          format: ""
        },
        {
          key: "value",
          title: config.value,
          width: "60%",
          className: "value",
          total: "",
          format: ""
        }
      ];
    }

    _getTemplateStyle(template) {
      var presets = {
        default: {
          fontSize: "12px",
          fontFamily: "Arial, Helvetica, sans-serif",
          headerBackground: "#ffffff",
          headerColor: "#555555",
          rowBackground: "#ffffff",
          alternateRowBackground: "",
          borderColor: "#d9d9d9",
          wrapperBorderColor: "#d9d9d9",
          textColor: "#555555",
          emptyTextColor: "#777777",
          showGrid: true,
          stickyHeader: true,
          headerFontWeight: "600"
        },

        report: {
          fontSize: "12px",
          fontFamily: "Arial, Helvetica, sans-serif",
          headerBackground: "#ffffff",
          headerColor: "#555555",
          rowBackground: "#ffffff",
          alternateRowBackground: "",
          borderColor: "#c9c9c9",
          wrapperBorderColor: "#ffffff",
          textColor: "#555555",
          emptyTextColor: "#777777",
          showGrid: false,
          stickyHeader: true,
          headerFontWeight: "600"
        },

        alternating: {
          fontSize: "12px",
          fontFamily: "Arial, Helvetica, sans-serif",
          headerBackground: "#f3f3f3",
          headerColor: "#333333",
          rowBackground: "#ffffff",
          alternateRowBackground: "#f7f7f7",
          borderColor: "#d9d9d9",
          wrapperBorderColor: "#d9d9d9",
          textColor: "#333333",
          emptyTextColor: "#777777",
          showGrid: true,
          stickyHeader: true,
          headerFontWeight: "600"
        },

        basic: {
          fontSize: "12px",
          fontFamily: "Arial, Helvetica, sans-serif",
          headerBackground: "#ffffff",
          headerColor: "#333333",
          rowBackground: "#ffffff",
          alternateRowBackground: "",
          borderColor: "#e5e5e5",
          wrapperBorderColor: "#d9d9d9",
          textColor: "#333333",
          emptyTextColor: "#777777",
          showGrid: true,
          stickyHeader: true,
          headerFontWeight: "400"
        }
      };

      return presets[template] || presets.default;
    }

    _parseStyleConfig() {
      var parsed = {};

      try {
        parsed = JSON.parse(this._styleConfig || "{}");
      } catch (e) {
        parsed = {};
      }

      var template = parsed.template || "default";
      var preset = this._getTemplateStyle(template);

      return {
        template: template,
        fontSize: parsed.fontSize || preset.fontSize,
        fontFamily: parsed.fontFamily || preset.fontFamily,
        headerBackground:
          parsed.headerBackground || preset.headerBackground,
        headerColor: parsed.headerColor || preset.headerColor,
        rowBackground: parsed.rowBackground || preset.rowBackground,
        alternateRowBackground:
          parsed.alternateRowBackground !== undefined
            ? parsed.alternateRowBackground
            : preset.alternateRowBackground,
        borderColor: parsed.borderColor || preset.borderColor,
        wrapperBorderColor:
          parsed.wrapperBorderColor || preset.wrapperBorderColor,
        textColor: parsed.textColor || preset.textColor,
        emptyTextColor: parsed.emptyTextColor || preset.emptyTextColor,
        rowHeight: parsed.rowHeight || "default",
        showGrid:
          parsed.showGrid !== undefined ? parsed.showGrid : preset.showGrid,
        stickyHeader:
          parsed.stickyHeader !== undefined
            ? parsed.stickyHeader
            : preset.stickyHeader,
        headerFontWeight:
          parsed.headerFontWeight || preset.headerFontWeight,
        cellPadding: parsed.cellPadding || "",
        columnWidthMode: parsed.columnWidthMode || "auto",
        showTotal: parsed.showTotal === true,
        totalLabel: parsed.totalLabel || "Total",
        totalMode: parsed.totalMode || "sum"
      };
    }

    _getPadding(styleConfig) {
      if (styleConfig.cellPadding) {
        return styleConfig.cellPadding;
      }

      if (styleConfig.rowHeight === "compact") {
        return "4px 6px";
      }

      if (styleConfig.rowHeight === "comfortable") {
        return "10px 12px";
      }

      return "6px 8px";
    }

    _formatValue(value, format) {
      if (value === null || value === undefined) {
        return "";
      }

      if (format === "number") {
        var numberValue = Number(String(value).replace(/,/g, ""));
        if (!isNaN(numberValue)) {
          return numberValue.toLocaleString();
        }
      }

      return value;
    }

    _toNumber(value) {
      var numberValue = Number(String(value || "").replace(/,/g, ""));
      return isNaN(numberValue) ? 0 : numberValue;
    }

    _getTotalValue(rows, column) {
      if (!column.total) {
        return "";
      }

      if (column.total === "count") {
        return rows.length;
      }

      if (column.total === "sum") {
        var sum = 0;

        for (var i = 0; i < rows.length; i++) {
          sum += this._toNumber(rows[i][column.key]);
        }

        return this._formatValue(sum, column.format);
      }

      return "";
    }

    _ruleMatches(rule, row) {
      if (!rule || !rule.column) {
        return false;
      }

      var cellValue =
        row && row[rule.column] !== undefined ? String(row[rule.column]) : "";
      var ruleValue =
        rule.value !== undefined && rule.value !== null
          ? String(rule.value)
          : "";
      var operator = rule.operator || "equals";

      if (operator === "equals") {
        return cellValue === ruleValue;
      }

      if (operator === "notEquals") {
        return cellValue !== ruleValue;
      }

      if (operator === "contains") {
        return cellValue.indexOf(ruleValue) !== -1;
      }

      if (operator === "startsWith") {
        return cellValue.indexOf(ruleValue) === 0;
      }

      if (operator === "endsWith") {
        return cellValue.lastIndexOf(ruleValue) ===
          cellValue.length - ruleValue.length;
      }

      if (operator === "empty") {
        return cellValue === "";
      }

      if (operator === "notEmpty") {
        return cellValue !== "";
      }

      return false;
    }

    _styleObjectToCss(style) {
      if (!style) {
        return "";
      }

      var allowed = {
        background: "background",
        backgroundColor: "background-color",
        color: "color",
        fontWeight: "font-weight",
        fontStyle: "font-style",
        textDecoration: "text-decoration"
      };

      var css = "";

      for (var key in style) {
        if (allowed[key]) {
          css += allowed[key] + ":" + this._safeCssValue(style[key], "") + ";";
        }
      }

      return css;
    }

    _getCellRuleStyle(rules, row, column) {
      var css = "";

      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];

        if (rule.target && rule.target !== "cell") {
          continue;
        }

        if (rule.applyTo && rule.applyTo !== column.key) {
          continue;
        }

        if (this._ruleMatches(rule, row)) {
          css += this._styleObjectToCss(rule.style);
        }
      }

      return css;
    }

    _getRowRuleStyle(rules, row) {
      var css = "";

      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];

        if (rule.target !== "row") {
          continue;
        }

        if (this._ruleMatches(rule, row)) {
          css += this._styleObjectToCss(rule.style);
        }
      }

      return css;
    }

    _buildHeaderHtml(columns, styleConfig) {
      var html = "";

      for (var i = 0; i < columns.length; i++) {
        var width =
          styleConfig.columnWidthMode === "manual" && columns[i].width
            ? ' style="width:' + this._escapeHtml(columns[i].width) + ';"'
            : "";

        html +=
          "<th" +
          width +
          ">" +
          this._escapeHtml(columns[i].title) +
          "</th>";
      }

      return html;
    }

    _buildBodyHtml(rows, columns, config, rules) {
      var html = "";

      if (rows.length === 0) {
        return (
          '<tr><td colspan="' +
          columns.length +
          '" class="empty">' +
          this._escapeHtml(config.emptyText) +
          "</td></tr>"
        );
      }

      for (var r = 0; r < rows.length; r++) {
        var rowStyle = this._getRowRuleStyle(rules, rows[r]);
        var rowStyleAttribute = rowStyle ? ' style="' + rowStyle + '"' : "";

        html += "<tr" + rowStyleAttribute + ">";

        for (var c = 0; c < columns.length; c++) {
          var key = columns[c].key;
          var className = columns[c].className
            ? " " + this._escapeHtml(columns[c].className)
            : "";
          var cellStyle = this._getCellRuleStyle(rules, rows[r], columns[c]);
          var cellStyleAttribute = cellStyle
            ? ' style="' + cellStyle + '"'
            : "";

          html +=
            '<td class="col-' +
            this._escapeHtml(key) +
            className +
            '"' +
            cellStyleAttribute +
            ">" +
            this._escapeHtml(
              this._formatValue(rows[r] ? rows[r][key] : "", columns[c].format)
            ) +
            "</td>";
        }

        html += "</tr>";
      }

      return html;
    }

    _buildTotalHtml(rows, columns, styleConfig) {
      if (!styleConfig.showTotal) {
        return "";
      }

      var hasTotal = false;
      var html = "<tr class='total-row'>";

      for (var c = 0; c < columns.length; c++) {
        var value = "";

        if (c === 0) {
          value = styleConfig.totalLabel;
        }

        var totalValue = this._getTotalValue(rows, columns[c]);

        if (totalValue !== "") {
          value = totalValue;
          hasTotal = true;
        }

        html +=
          "<td>" +
          this._escapeHtml(value) +
          "</td>";
      }

      html += "</tr>";

      return hasTotal ? html : "";
    }

    _buildCss(styleConfig) {
      var fontFamily = this._safeCssValue(
        styleConfig.fontFamily,
        "Arial, Helvetica, sans-serif"
      );
      var fontSize = this._safeCssValue(styleConfig.fontSize, "12px");
      var headerBackground = this._safeCssValue(
        styleConfig.headerBackground,
        "#ffffff"
      );
      var headerColor = this._safeCssValue(
        styleConfig.headerColor,
        "#333333"
      );
      var rowBackground = this._safeCssValue(
        styleConfig.rowBackground,
        "#ffffff"
      );
      var alternateRowBackground = this._safeCssValue(
        styleConfig.alternateRowBackground,
        ""
      );
      var borderColor = this._safeCssValue(
        styleConfig.borderColor,
        "#e5e5e5"
      );
      var wrapperBorderColor = this._safeCssValue(
        styleConfig.wrapperBorderColor,
        "#d9d9d9"
      );
      var textColor = this._safeCssValue(styleConfig.textColor, "#333333");
      var emptyTextColor = this._safeCssValue(
        styleConfig.emptyTextColor,
        "#777777"
      );
      var headerFontWeight = this._safeCssValue(
        styleConfig.headerFontWeight,
        "600"
      );
      var padding = this._safeCssValue(
        this._getPadding(styleConfig),
        "6px 8px"
      );
      var gridBorder = styleConfig.showGrid
        ? "1px solid " + borderColor
        : "none";
      var stickyHeader = styleConfig.stickyHeader
        ? "position:sticky;top:0;"
        : "";
      var tableLayout =
        styleConfig.columnWidthMode === "manual" ? "fixed" : "auto";

      return (
        ":host{display:block;width:100%;height:100%;box-sizing:border-box;font-family:" +
        fontFamily +
        ";color:" +
        textColor +
        ";}" +
        ".wrapper{width:100%;height:100%;overflow:auto;box-sizing:border-box;border:1px solid " +
        wrapperBorderColor +
        ";background:" +
        rowBackground +
        ";}" +
        "table{width:100%;border-collapse:collapse;font-size:" +
        fontSize +
        ";table-layout:" +
        tableLayout +
        ";}" +
        "thead th{" +
        stickyHeader +
        "background:" +
        headerBackground +
        ";color:" +
        headerColor +
        ";z-index:1;font-weight:" +
        headerFontWeight +
        ";border-bottom:1px solid " +
        borderColor +
        ";}" +
        "th,td{border-right:" +
        gridBorder +
        ";border-bottom:" +
        gridBorder +
        ";padding:" +
        padding +
        ";text-align:left;vertical-align:top;box-sizing:border-box;}" +
        "th:last-child,td:last-child{border-right:none;}" +
        "tbody td{background:" +
        rowBackground +
        ";color:" +
        textColor +
        ";}" +
        (alternateRowBackground
          ? "tbody tr:nth-child(even) td{background:" +
            alternateRowBackground +
            ";}"
          : "") +
        ".operator{white-space:nowrap;font-weight:600;}" +
        ".value{word-break:break-word;white-space:pre-wrap;}" +
        ".empty{text-align:center;color:" +
        emptyTextColor +
        ";padding:16px;}" +
        ".total-row td{font-weight:700;border-top:2px solid " +
        borderColor +
        ";}" +
        this._customCss
      );
    }

    render() {
      var rows = this._parseRows();
      var config = this._parseConfig();
      var columns = this._parseColumns(config);
      var rules = this._parseRules();
      var styleConfig = this._parseStyleConfig();

      if (columns.length === 0) {
        columns = [
          {
            key: "value",
            title: "Value",
            width: "100%",
            className: "value",
            total: "",
            format: ""
          }
        ];
      }

      var headerHtml = this._buildHeaderHtml(columns, styleConfig);
      var bodyHtml = this._buildBodyHtml(rows, columns, config, rules);
      var totalHtml = this._buildTotalHtml(rows, columns, styleConfig);
      var css = this._buildCss(styleConfig);

      this.shadowRoot.innerHTML =
        "<style>" +
        css +
        "</style>" +
        "<div class='wrapper'>" +
        "<table>" +
        "<thead><tr>" +
        headerHtml +
        "</tr></thead>" +
        "<tbody>" +
        bodyHtml +
        totalHtml +
        "</tbody>" +
        "</table>" +
        "</div>";
    }
  }

  customElements.define("com-company-sac-appendix-table", AppendixTable);
})();