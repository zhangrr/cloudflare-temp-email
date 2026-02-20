import type { Env, Hono } from 'hono';

const inboxHtml = `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Inbox</title>
    <style>
      :root {
        --bg: #0b1220;
        --panel: rgba(255,255,255,0.06);
        --panel2: rgba(255,255,255,0.09);
        --text: rgba(255,255,255,0.92);
        --muted: rgba(255,255,255,0.70);
        --border: rgba(255,255,255,0.14);
        --accent: #60a5fa;
        --danger: #ef4444;
        --ok: #22c55e;
        --shadow: 0 12px 40px rgba(0,0,0,0.35);
        --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: var(--sans);
        background: radial-gradient(1200px 600px at 20% 0%, rgba(96,165,250,0.18), transparent 60%),
                    radial-gradient(1000px 600px at 80% 20%, rgba(34,197,94,0.12), transparent 55%),
                    var(--bg);
        color: var(--text);
      }
      a { color: var(--accent); }
      .container { max-width: 1200px; margin: 0 auto; padding: 18px; }
      .header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; flex-wrap: wrap;
        padding: 14px 16px;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: var(--panel);
        box-shadow: var(--shadow);
      }
      .title { display: flex; gap: 10px; align-items: baseline; }
      .title h1 { margin: 0; font-size: 18px; letter-spacing: 0.2px; }
      .title .sub { color: var(--muted); font-size: 12px; }

      .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
      .input {
        display: flex; gap: 8px; align-items: center;
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(0,0,0,0.18);
      }
      .input label { font-size: 12px; color: var(--muted); }
      .input input {
        border: none; outline: none;
        background: transparent;
        color: var(--text);
        font-size: 14px;
        min-width: 240px;
      }
      .btn {
        appearance: none;
        border: 1px solid var(--border);
        background: rgba(0,0,0,0.12);
        color: var(--text);
        padding: 9px 12px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 13px;
      }
      .btn:hover { background: rgba(255,255,255,0.08); }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn.primary { border-color: rgba(96,165,250,0.45); }
      .btn.danger { border-color: rgba(239,68,68,0.45); }
      .status { font-size: 12px; color: var(--muted); }
      .status .ok { color: var(--ok); }
      .status .bad { color: var(--danger); }

      .panel {
        margin-top: 14px;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: var(--panel);
        box-shadow: var(--shadow);
      }

      .pager {
        display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between;
        margin-bottom: 10px;
      }
      .pager .left, .pager .right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .pill {
        padding: 6px 10px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: rgba(0,0,0,0.14);
        color: var(--muted);
        font-size: 12px;
      }
      .miniInput {
        width: 88px;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(0,0,0,0.18);
        color: var(--text);
        outline: none;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 12px;
        border: 1px solid var(--border);
      }
      thead th {
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        padding: 10px 10px;
        color: var(--muted);
        background: rgba(0,0,0,0.18);
        border-bottom: 1px solid var(--border);
      }
      tbody td {
        padding: 10px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        vertical-align: top;
        font-size: 13px;
      }
      tbody tr:hover { background: rgba(255,255,255,0.04); }
      .mono { font-family: var(--mono); }
      .small { font-size: 12px; color: var(--muted); }
      .subject { font-weight: 600; }
      .actions { display: flex; gap: 8px; flex-wrap: wrap; }

      dialog {
        border: 1px solid var(--border);
        background: rgba(10,15,28,0.96);
        color: var(--text);
        border-radius: 14px;
        box-shadow: var(--shadow);
        width: min(980px, calc(100vw - 24px));
      }
      dialog::backdrop { background: rgba(0,0,0,0.6); }
      .dlgHeader { display:flex; justify-content: space-between; align-items: center; gap: 10px; }
      .dlgHeader h2 { margin: 0; font-size: 14px; color: var(--muted); font-weight: 600; }
      .pre {
        margin-top: 10px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(0,0,0,0.22);
        overflow: auto;
        max-height: 60vh;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: var(--mono);
        font-size: 12px;
        line-height: 1.45;
      }

      .hint {
        margin-top: 10px;
        color: var(--muted);
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="title">
          <h1>/inbox</h1>
          <div class="sub">Admin mails viewer (latest 20 / page)</div>
        </div>
        <div class="row">
          <div class="input">
            <label for="pw">Admin 密码</label>
            <input id="pw" type="password" autocomplete="current-password" placeholder="输入 x-admin-auth" />
          </div>
          <button id="btnLoad" class="btn primary" disabled>加载</button>
          <button id="btnClear" class="btn danger">清空</button>
          <div id="status" class="status"></div>
        </div>
      </div>

      <div class="panel">
        <div class="pager">
          <div class="left">
            <span id="pillInfo" class="pill">未登录</span>
            <span id="pillCount" class="pill">Total: ?</span>
          </div>
          <div class="right">
            <button id="btnFirst" class="btn" disabled>首页</button>
            <button id="btnPrev" class="btn" disabled>上一页</button>
            <button id="btnNext" class="btn" disabled>下一页</button>
            <button id="btnLast" class="btn" disabled>末页</button>
            <span class="small">跳转</span>
            <input id="pageInput" class="miniInput" inputmode="numeric" placeholder="页码" />
            <button id="btnGo" class="btn" disabled>Go</button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 90px;">ID</th>
              <th style="width: 190px;">时间</th>
              <th style="width: 240px;">FROM</th>
              <th style="width: 240px;">TO</th>
              <th>Subject</th>
              <th style="width: 170px;">操作</th>
            </tr>
          </thead>
          <tbody id="tbody">
            <tr><td colspan="6" class="small">请输入 Admin 密码后点击“加载”。</td></tr>
          </tbody>
        </table>

        <div class="hint">
          说明：此页面通过调用后端现有的 <span class="mono">/admin/mails</span> 接口读取邮件；密码只保存在当前页面内存中，不会写入 localStorage。
        </div>
      </div>
    </div>

    <dialog id="dlg">
      <div class="dlgHeader">
        <h2 id="dlgTitle">Mail</h2>
        <button id="dlgClose" class="btn">关闭</button>
      </div>
      <div id="dlgMeta" class="small" style="margin-top: 8px;"></div>
      <div id="dlgRaw" class="pre"></div>
    </dialog>

    <script type="module">
      const $ = (id) => document.getElementById(id);

      const state = {
        adminPassword: '',
        pageSize: 20,
        page: 1,
        totalCount: null,
        lastPage: null,
        authed: false,
        loading: false,
      };

      const els = {
        pw: $("pw"),
        btnLoad: $("btnLoad"),
        btnClear: $("btnClear"),
        status: $("status"),
        pillInfo: $("pillInfo"),
        pillCount: $("pillCount"),
        btnFirst: $("btnFirst"),
        btnPrev: $("btnPrev"),
        btnNext: $("btnNext"),
        btnLast: $("btnLast"),
        pageInput: $("pageInput"),
        btnGo: $("btnGo"),
        tbody: $("tbody"),
        dlg: $("dlg"),
        dlgTitle: $("dlgTitle"),
        dlgMeta: $("dlgMeta"),
        dlgRaw: $("dlgRaw"),
        dlgClose: $("dlgClose"),
      };

      const setStatus = (kind, text) => {
        const cls = kind === "ok" ? "ok" : (kind === "bad" ? "bad" : "");
        els.status.innerHTML = cls ? '<span class="' + cls + '">' + escapeHtml(text) + '</span>' : escapeHtml(text);
      };

      const escapeHtml = (s) => String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

      const formatTime = (t) => {
        if (!t) return "";
        try {
          const d = new Date(t);
          if (Number.isNaN(d.getTime())) return String(t);
          return d.toLocaleString();
        } catch {
          return String(t);
        }
      };

      const extractSubject = (raw) => {
        if (!raw) return "";
        const head = raw.split(/\\r?\\n\\r?\\n/)[0] || "";
        const lines = head.split(/\\r?\\n/);
        const key = "subject:";
        let found = null;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (found == null) {
            if (line.toLowerCase().startsWith(key)) {
              found = line.slice(key.length).trim();
            }
          } else {
            if (/^[ \\t]/.test(line)) {
              found += " " + line.trim();
            } else {
              break;
            }
          }
        }
        return found || "";
      };

      const updateControls = () => {
        const authed = state.authed;
        const hasPw = state.adminPassword.trim().length > 0;
        const canUsePager = authed && state.lastPage != null;

        els.btnLoad.disabled = !hasPw || state.loading;
        els.btnClear.disabled = state.loading;

        els.btnFirst.disabled = !canUsePager || state.page <= 1 || state.loading;
        els.btnPrev.disabled = !canUsePager || state.page <= 1 || state.loading;
        els.btnNext.disabled = !canUsePager || state.page >= state.lastPage || state.loading;
        els.btnLast.disabled = !canUsePager || state.page >= state.lastPage || state.loading;
        els.btnGo.disabled = !canUsePager || state.loading;

        if (authed) {
          els.pillInfo.textContent = "已登录";
        } else {
          els.pillInfo.textContent = "未登录";
        }
        els.pillCount.textContent = "Total: " + (state.totalCount == null ? "?" : String(state.totalCount));
      };

      const setLoading = (loading) => {
        state.loading = loading;
        updateControls();
      };

      const renderRows = (results) => {
        if (!results || results.length === 0) {
          els.tbody.innerHTML = '<tr><td colspan="6" class="small">没有邮件。</td></tr>';
          return;
        }
        const html = results.map((m) => {
          const subject = extractSubject(m.raw) || "";
          return (
            '<tr>' +
              '<td class="mono">' + escapeHtml(m.id) + '</td>' +
              '<td>' + escapeHtml(formatTime(m.created_at)) + '</td>' +
              '<td class="mono">' + escapeHtml(m.source || "") + '</td>' +
              '<td class="mono">' + escapeHtml(m.address || "") + '</td>' +
              '<td class="subject">' + escapeHtml(subject || "(no subject)") + '</td>' +
              '<td>' +
                '<div class="actions">' +
                  '<button class="btn" data-act="view" data-id="' + escapeHtml(m.id) + '">查看 Raw</button>' +
                '</div>' +
              '</td>' +
            '</tr>'
          );
        }).join("");
        els.tbody.innerHTML = html;
      };

      const apiFetch = async (path) => {
        const res = await fetch(path, {
          method: "GET",
          headers: {
            "x-admin-auth": state.adminPassword,
            "x-lang": "zh",
            "content-type": "application/json",
          },
        });
        const text = await res.text();
        if (!res.ok) {
          throw new Error('[' + res.status + '] ' + text);
        }
        try {
          return JSON.parse(text);
        } catch {
          throw new Error('Invalid JSON: ' + text.slice(0, 200));
        }
      };

      const loadPage = async (page) => {
        if (!state.adminPassword.trim()) {
          setStatus("bad", "请输入 Admin 密码");
          return;
        }

        state.page = Math.max(1, page);
        setLoading(true);
        setStatus("", "加载中…");
        try {
          const offset = (state.page - 1) * state.pageSize;
          const data = await apiFetch('/admin/mails?limit=' + state.pageSize + '&offset=' + offset);

          if (state.totalCount == null && typeof data.count === "number" && data.count >= 0) {
            state.totalCount = data.count;
            state.lastPage = Math.max(1, Math.ceil(state.totalCount / state.pageSize));
          }

          state.authed = true;
          renderRows(data.results || []);

          if (state.lastPage != null) {
            setStatus("ok", "第 " + state.page + " / " + state.lastPage + " 页");
          } else {
            setStatus("ok", "已加载");
          }
        } catch (e) {
          state.authed = false;
          state.totalCount = null;
          state.lastPage = null;
          els.tbody.innerHTML = '<tr><td colspan="6" class="small">加载失败：' + escapeHtml(e.message || String(e)) + '</td></tr>';
          setStatus("bad", "认证失败或接口错误");
        } finally {
          setLoading(false);
        }
      };

      const clearAll = () => {
        state.adminPassword = "";
        state.authed = false;
        state.page = 1;
        state.totalCount = null;
        state.lastPage = null;
        els.pw.value = "";
        els.pageInput.value = "";
        els.tbody.innerHTML = '<tr><td colspan="6" class="small">请输入 Admin 密码后点击“加载”。</td></tr>';
        setStatus("", "");
        updateControls();
      };

      els.pw.addEventListener("input", () => {
        state.adminPassword = els.pw.value;
        updateControls();
      });

      els.btnLoad.addEventListener("click", async () => {
        state.adminPassword = els.pw.value;
        state.page = 1;
        state.totalCount = null;
        state.lastPage = null;
        await loadPage(1);
      });

      els.pw.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          els.btnLoad.click();
        }
      });

      els.btnClear.addEventListener("click", () => clearAll());

      els.btnFirst.addEventListener("click", async () => loadPage(1));
      els.btnPrev.addEventListener("click", async () => loadPage(state.page - 1));
      els.btnNext.addEventListener("click", async () => loadPage(state.page + 1));
      els.btnLast.addEventListener("click", async () => {
        if (state.lastPage != null) await loadPage(state.lastPage);
      });
      els.btnGo.addEventListener("click", async () => {
        const n = parseInt(els.pageInput.value, 10);
        if (!Number.isFinite(n)) return;
        if (state.lastPage != null) {
          await loadPage(Math.min(Math.max(1, n), state.lastPage));
        } else {
          await loadPage(Math.max(1, n));
        }
      });
      els.pageInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") els.btnGo.click();
      });

      const openDialog = (mail) => {
        els.dlgTitle.textContent = "Mail ID: " + (mail.id ?? "");
        els.dlgMeta.textContent = "FROM: " + (mail.source ?? "") + "    TO: " + (mail.address ?? "") + "    TIME: " + formatTime(mail.created_at);
        els.dlgRaw.textContent = mail.raw || "";
        els.dlg.showModal();
      };

      els.dlgClose.addEventListener("click", () => els.dlg.close());
      els.dlg.addEventListener("click", (e) => {
        const rect = els.dlg.getBoundingClientRect();
        const inDialog =
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
        if (!inDialog) els.dlg.close();
      });

      els.tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-act]");
        if (!btn) return;
        const act = btn.getAttribute("data-act");
        if (act !== "view") return;
        const id = btn.getAttribute("data-id");
        if (!id) return;

        setLoading(true);
        try {
          const offset = (state.page - 1) * state.pageSize;
          const data = await apiFetch('/admin/mails?limit=' + state.pageSize + '&offset=' + offset);
          const mail = (data.results || []).find((m) => String(m.id) === String(id));
          if (!mail) {
            setStatus("bad", "未找到该邮件（可能已被删除）");
            return;
          }
          openDialog(mail);
        } catch (e2) {
          setStatus("bad", e2.message || String(e2));
        } finally {
          setLoading(false);
        }
      });

      updateControls();
    </script>
  </body>
</html>`;

export function registerInboxRoutes<E extends Env>(app: Hono<E>): void {
  app.get('/inbox', (c) => {
    return new Response(inboxHtml, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  });
}
