(function () {
  class AppendixTable extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      this._rows = "[]";
      this._columns = "";
      this._config = '{"label":"Filter","op":"Operator","value":"Value","showOperator":true}';
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
      this._config = value || '{"label":"Filter","op":"Operator","value":"Value","showOperator":true}';
      this.render();
    }

    get columns() {
      return this._columns;
    }

    set columns(value) {
      this._columns = value || "";
      this.render();
    }

    setRows(rows) {
      this._rows = rows || "[]";
      this.render();
    }

    setConfig(config) {
      this._config = config || '{"label":"Filter","op":"Operator","value":"Value","showOperator":true}';
      this.render();
    }

    setColumns(columns) {
      this._columns = columns || "";
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

    _parseRows() {
      try {
        var parsed = JSON.parse(this._rows || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
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
                className: column.className || ""
              };
            });
        }
      } catch (e) {}

      if (config.showOperator) {
        return [
          { key: "label", title: config.label, width: "35%", className: "label" },
          { key: "op", title: config.op, width: "15%", className: "operator" },
          { key: "value", title: config.value, width: "50%", className: "value" }
        ];
      }

      return [
        { key: "label", title: config.label, width: "40%", className: "label" },
        { key: "value", title: config.value, width: "60%", className: "value" }
      ];
    }

    _buildHeaderHtml(columns) {
      var html = "";

      for (var i = 0; i < columns.length; i++) {
        var width = columns[i].width
          ? ' style="width:' + this._escapeHtml(columns[i].width) + ';"'
          : "";

        html += "<th" + width + ">" + this._escapeHtml(columns[i].title) + "</th>";
      }

      return html;
    }

    _buildBodyHtml(rows, columns, config) {
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
        html += "<tr>";

        for (var c = 0; c < columns.length; c++) {
          var key = columns[c].key;
          var className = columns[c].className
            ? ' class="' + this._escapeHtml(columns[c].className) + '"'
            : "";

          html +=
            "<td" +
            className +
            ">" +
            this._escapeHtml(rows[r] ? rows[r][key] : "") +
            "</td>";
        }

        html += "</tr>";
      }

      return html;
    }

    render() {
      var rows = this._parseRows();
      var config = this._parseConfig();
      var columns = this._parseColumns(config);

      var headerHtml = this._buildHeaderHtml(columns);
      var bodyHtml = this._buildBodyHtml(rows, columns, config);

      this.shadowRoot.innerHTML =
        "<style>" +
        ":host{display:block;width:100%;height:100%;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;}" +
        ".wrapper{width:100%;height:100%;overflow:auto;box-sizing:border-box;border:1px solid #d9d9d9;background:#fff;}" +
        "table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;}" +
        "thead th{position:sticky;top:0;background:#f3f3f3;z-index:1;font-weight:600;border-bottom:1px solid #cfcfcf;}" +
        "th,td{border-right:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;padding:6px 8px;text-align:left;vertical-align:top;box-sizing:border-box;}" +
        "th:last-child,td:last-child{border-right:none;}" +
        ".operator{white-space:nowrap;font-weight:600;}" +
        ".value{word-break:break-word;white-space:pre-wrap;}" +
        ".empty{text-align:center;color:#777;padding:16px;}" +
        "</style>" +
        "<div class='wrapper'>" +
        "<table>" +
        "<thead><tr>" +
        headerHtml +
        "</tr></thead>" +
        "<tbody>" +
        bodyHtml +
        "</tbody>" +
        "</table>" +
        "</div>";
    }
  }

  customElements.define("com-company-sac-appendix-table", AppendixTable);
})();