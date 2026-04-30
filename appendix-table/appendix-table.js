(function () {
  class AppendixTable extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._rows = "[]";
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

    setRows(rows) {
      this._rows = rows || "[]";
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
        if (!Array.isArray(parsed)) {
          return [];
        }
        return parsed;
      } catch (e) {
        return [];
      }
    }

    render() {
      var rows = this._parseRows();

      var bodyHtml = "";

      if (rows.length === 0) {
        bodyHtml =
          '<tr><td colspan="3" class="empty">Nejsou dostupná žádná data.</td></tr>';
      } else {
        for (var i = 0; i < rows.length; i++) {
          bodyHtml +=
            "<tr>" +
            "<td>" + this._escapeHtml(rows[i].label) + "</td>" +
            "<td class='operator'>" + this._escapeHtml(rows[i].op) + "</td>" +
            "<td class='value'>" + this._escapeHtml(rows[i].value) + "</td>" +
            "</tr>";
        }
      }

      this.shadowRoot.innerHTML =
        "<style>" +
        ":host{display:block;width:100%;height:100%;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;}" +
        ".wrapper{width:100%;height:100%;overflow:auto;box-sizing:border-box;border:1px solid #d9d9d9;background:#fff;}" +
        "table{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;}" +
        "thead th{position:sticky;top:0;background:#f3f3f3;z-index:1;font-weight:600;border-bottom:1px solid #cfcfcf;}" +
        "th,td{border-right:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;padding:6px 8px;text-align:left;vertical-align:top;box-sizing:border-box;}" +
        "th:last-child,td:last-child{border-right:none;}" +
        "th:nth-child(1),td:nth-child(1){width:35%;}" +
        "th:nth-child(2),td:nth-child(2){width:15%;}" +
        "th:nth-child(3),td:nth-child(3){width:50%;}" +
        ".operator{white-space:nowrap;font-weight:600;}" +
        ".value{word-break:break-word;white-space:pre-wrap;}" +
        ".empty{text-align:center;color:#777;padding:16px;}" +
        "</style>" +
        "<div class='wrapper'>" +
        "<table>" +
        "<thead>" +
        "<tr>" +
        "<th>Proměnná / filtr</th>" +
        "<th>Operátor</th>" +
        "<th>Hodnota</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>" +
        bodyHtml +
        "</tbody>" +
        "</table>" +
        "</div>";
    }
  }

  customElements.define("com-company-sac-appendix-table", AppendixTable);
})();