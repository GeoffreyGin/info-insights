// ===== 深色/浅色模式切换 =====
function initTheme() {
  const STORAGE_KEY = "nba-insight-theme";
  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");

  // 读取已保存的主题，否则跟随系统偏好
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    // 跟随系统偏好
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (icon) icon.textContent = "☀️";
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (icon) icon.textContent = "🌙";
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  // 初始化
  applyTheme(getPreferredTheme());

  // 绑定点击事件
  if (toggle) {
    toggle.addEventListener("click", toggleTheme);
  }

  // 监听系统主题变化（当用户未手动设置时生效）
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      // 仅在用户从未手动切换过时跟随系统
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }
}

// ===== 状态与渲染 =====
function setStatus(message, type = "info") {
  const status = document.getElementById("status");
  if (!message) {
    status.hidden = true;
    status.textContent = "";
    status.dataset.type = "";
    return;
  }

  status.hidden = false;
  status.textContent = message;
  status.dataset.type = type;
}

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function getMarked() {
  // Prefer global UMD build if present
  if (globalThis.marked && typeof globalThis.marked.parse === "function") {
    return globalThis.marked;
  }

  throw new Error(
    "Markdown 解析器 marked 未加载（请检查 index.html 是否成功加载 ./vendor/marked.min.js）。"
  );
}

function parseMarkdown(markedLib, markdown) {
  const options = {
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false,
  };

  if (markedLib && typeof markedLib.parse === "function") {
    return markedLib.parse(markdown, options);
  }
  if (typeof markedLib === "function") {
    return markedLib(markdown, options);
  }

  throw new Error("marked 已加载但未暴露 parse()。");
}

async function renderMarkdown(markdown) {
  const markedLib = await getMarked();
  const html = parseMarkdown(markedLib, markdown);

  const purifier = globalThis.DOMPurify;
  if (!purifier || typeof purifier.sanitize !== "function") {
    throw new Error("HTML 清洗器 DOMPurify 未加载。");
  }

  const clean = purifier.sanitize(html, {
    USE_PROFILES: { html: true },
  });

  const content = document.getElementById("content");
  content.innerHTML = clean;
}

async function loadReport(reportPath) {
  setStatus(`正在加载：${reportPath}`);

  try {
    const markdown = await fetchText(reportPath);
    await renderMarkdown(markdown);
    setStatus(`已加载：${reportPath}`);
  } catch (err) {
    console.error(err);
    setStatus(`加载失败：${reportPath}。${err?.message || err}`, "error");

    const content = document.getElementById("content");
    content.innerHTML = "";
  }
}

function wireUi() {
  initTheme();
  loadReport("report.md");
}

wireUi();
