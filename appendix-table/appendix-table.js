(function () {
  class AppendixTable extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      this._rows = "[]";
      this._columns = "";
      this._config =
        '{"label":"Filter","op":"Operator","value":"Value","showOperator":true,"emptyText":"Nejsou dostupná žádná data."}';
      this._styleConfig = "{}";
      this._customCss = "";
    }

    connectedCallback() {
      this.render();
    }

    // ====== PROPERTIES ======
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

    // ====== METHODS ======
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

    setData(data) {
      try {
        var parsed = JSON.parse(data || "{}");

        if (parsed.config) this._config = JSON.stringify(parsed.config);
        if (parsed.columns) this._columns = JSON.stringify(parsed.columns);
        if (parsed.styleConfig)
          this._styleConfig = JSON.stringify(parsed.styleConfig);
        if (parsed.customCss) this._customCss = parsed.customCss;
        if (parsed.rows) this._rows = JSON.stringify(parsed.rows);
      } catch (e) {
        this._rows = "[]";
      }

      this.render();
    }

    clear() {
      this._rows = "[]";
      this.render();
    }

    // ====== PARSERS ======
    _parseRows() {
      try {
        var r = JSON.parse(this._rows || "[]");
        return Array.isArray(r) ? r : [];
      } catch (e) {
        return [];
      }
    }

    _parseConfig() {
      try {
        var c = JSON.parse(this._config || "{}");
        return {
          label: c.label || "Filter",
          op: c.op || "Operator",
          value: c.value || "Value",
          showOperator: c.showOperator !== false,
          emptyText: c.emptyText || "Nejsou dostupná žádná data."
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
        var cols = JSON.parse(this._columns || "[]");
        if (Array.isArray(cols) && cols.length) {
          return cols.map(function (c) {
            return {
              key: c.key,
              title: c.title || c.key,
              width: c.width || "",
              className: c.className || ""
            };
          });
        }
      } catch (e) {}

      if (config.showOperator) {
        return [
          { key: "label", title: config.label },
          { key: "op", title: config.op },
          { key: "value", title: config.value }
        ];
      }

      return [
        { key: "label", title: config.label },
        { key: "value", title: config.value }
      ];
    }

    _parseStyle() {
      try {
        var s = JSON.parse(this._styleConfig || "{}");
        return {
          fontSize: s.fontSize || "12px",
          fontFamily: s.fontFamily || "Arial, Helvetica, sans-serif",
          headerBg: s.headerBackground || "#f3f3f3",
          headerColor: s.headerColor || "#333",
          rowBg: s.rowBackground || "#fff",
          altRowBg: s.alternateRowBackground || "",
          borderColor: s.borderColor || "#e5e5e5",
          textColor: s.textColor || "#333",
          rowHeight: s.rowHeight || "default",
          showGrid: s.showGrid !== false,
          stickyHeader: s.stickyHeader !== false
        };
      } catch (e) {
        return {};
      }
    }

    // ====== RENDER ======
    render() {
      var rows = this._parseRows();
      var config = this._parseConfig();
      var columns = this._parseColumns(config);
      var style = this._parseStyle();

      var padding =
        style.rowHeight === "compact"
          ? "4px 6px"
          : style.rowHeight === "comfortable"
          ? "10px 12px"
          : "6px 8px";

      var border = style.showGrid
        ? "1px solid " + style.borderColor
        : "none";

      var sticky = style.stickyHeader ? "position:sticky;top:0;" : "";

      var header = "";
      columns.forEach(function (c) {
        header += "<th>" + c.title + "</th>";
      });

      var body = "";

      if (!rows.length) {
        body =
          '<tr><td colspan="' +
          columns.length +
          '" class="empty">' +
          config.emptyText +
          "</td></tr>";
      } else {
        rows.forEach(function (r) {
          body += "<tr>";
          columns.forEach(function (c) {
            body += "<td>" + (r[c.key] || "") + "</td>";
          });
          body += "</tr>";
        });
      }

      this.shadowRoot.innerHTML =
        "<style>" +
        ":host{display:block;font-family:" +
        style.fontFamily +
        ";color:" +
        style.textColor +
        ";}" +
        "table{width:100%;border-collapse:collapse;font-size:" +
        style.fontSize +
        ";}" +
        "th{background:" +
        style.headerBg +
        ";color:" +
        style.headerColor +
        ";" +
        sticky +
        "}" +
        "th,td{border:" +
        border +
        ";padding:" +
        padding +
        ";}" +
        (style.altRowBg
          ? "tr:nth-child(even){background:" + style.altRowBg + ";}"
          : "") +
        this._customCss +
        "</style>" +
        "<table><thead><tr>" +
        header +
        "</tr></thead><tbody>" +
        body +
        "</tbody></table>";
    }
  }

  customElements.define("com-company-sac-appendix-table", AppendixTable);
})();