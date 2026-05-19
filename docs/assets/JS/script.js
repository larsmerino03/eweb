// assets/js/script.js
// Open/Close + Taskbar Buttons + Tabs + Clock + Drag + NET + Minimize + Maximize

(() => {
  "use strict";

  let topZ = 10;

  const TASKBAR_HEIGHT = 56;
  const taskbarContainer = document.getElementById("taskbar-windows");
  const netEl = document.getElementById("net-status");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function setActiveTaskbarButton(windowId) {
    document.querySelectorAll(".taskbar-window-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.taskbar === windowId);
    });
  }

  function bringToFront(win) {
    topZ += 1;
    win.style.zIndex = String(topZ);
    setActiveTaskbarButton(win.id);
  }

  function createTaskbarButton(win) {
    if (!taskbarContainer) return;

    const id = win.id;

    if (taskbarContainer.querySelector(`[data-taskbar="${id}"]`)) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "taskbar-window-btn";
    btn.dataset.taskbar = id;

    const desktopIcon = document.querySelector(`[data-open="${id}"] img`);

    if (desktopIcon) {
      const icon = document.createElement("img");
      icon.src = desktopIcon.src;
      icon.alt = "";
      icon.className = "taskbar-window-icon";
      btn.appendChild(icon);
    } else {
      btn.textContent = id;
    }

    btn.addEventListener("click", () => {
      const isOpen = win.classList.contains("is-open");
      const isActive = btn.classList.contains("active");

      if (isOpen && isActive) {
        minimizeWindow(win);
        return;
      }

      showWindow(win);
      bringToFront(win);
    });

    taskbarContainer.appendChild(btn);
  }

  function removeTaskbarButton(win) {
    if (!taskbarContainer) return;
    const btn = taskbarContainer.querySelector(`[data-taskbar="${win.id}"]`);
    if (btn) btn.remove();
  }

  function showWindow(win) {
    win.classList.add("is-open");
    win.setAttribute("aria-hidden", "false");

    const rect = win.getBoundingClientRect();

    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(
      0,
      window.innerHeight - TASKBAR_HEIGHT - rect.height
    );

    const left = clamp(rect.left, 0, maxLeft);
    const top = clamp(rect.top, 0, maxTop);

    win.style.position = "absolute";
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
    win.style.right = "auto";
    win.style.bottom = "auto";
  }

  function minimizeWindow(win) {
    win.classList.remove("is-open");
    win.setAttribute("aria-hidden", "true");

    const btn = document.querySelector(
      `.taskbar-window-btn[data-taskbar="${win.id}"]`
    );
    if (btn) btn.classList.remove("active");
  }

  function closeWindow(win) {
    win.classList.remove("is-open");
    win.classList.remove("maximized");
    win.setAttribute("aria-hidden", "true");
    removeTaskbarButton(win);

    const btn = win.querySelector("[data-maximize]");
    if (btn) {
      btn.textContent = "▢";
      btn.title = "Maximieren";
      btn.setAttribute("aria-label", "Fenster maximieren");
    }
  }

  function toggleMaximize(win) {
    const btn = win.querySelector("[data-maximize]");
    const isMax = win.classList.toggle("maximized");

    if (btn) {
      btn.textContent = isMax ? "❐" : "▢";
      btn.title = isMax ? "Wiederherstellen" : "Maximieren";
      btn.setAttribute(
        "aria-label",
        isMax ? "Fenster wiederherstellen" : "Fenster maximieren"
      );
    }

    bringToFront(win);
  }

  function initOpenClose() {
    document.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-open");
        const win = id ? document.getElementById(id) : null;
        if (!win) return;

        createTaskbarButton(win);
        showWindow(win);
        bringToFront(win);
      });
    });

    document.querySelectorAll("[data-minimize]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const win = btn.closest(".window");
        if (!win) return;

        minimizeWindow(win);
      });
    });

    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const win = btn.closest(".window");
        if (!win) return;

        closeWindow(win);
      });
    });

    document.querySelectorAll("[data-maximize]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const win = btn.closest(".window");
        if (!win) return;

        toggleMaximize(win);
      });
    });

    document.querySelectorAll(".window .win-topbar").forEach((bar) => {
      bar.addEventListener("dblclick", (e) => {
        if (e.target.closest(".win-controls")) return;

        const win = bar.closest(".window");
        if (!win) return;

        toggleMaximize(win);
      });
    });

    document.querySelectorAll(".window").forEach((win) => {
      win.addEventListener("mousedown", () => {
        if (!win.classList.contains("is-open")) return;
        bringToFront(win);
      });
    });
  }

  function initTabs() {
    document.querySelectorAll(".win-tab[data-iframe-src]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const src = tab.getAttribute("data-iframe-src");
        const iframe = document.getElementById("iframe-ausruestung");
        if (iframe && src) iframe.src = src;
      });
    });
  }

  function initClock() {
    function updateClock() {
      const el = document.getElementById("clock");
      if (!el) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      el.textContent = `${hh}:${mm}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  function initDrag() {
    document.querySelectorAll(".window").forEach((win) => {
      const header = win.querySelector(".win-topbar");
      if (!header) return;

      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      const iframes = Array.from(win.querySelectorAll("iframe"));

      header.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        if (!win.classList.contains("is-open")) return;
        if (e.target.closest(".win-controls")) return;
        if (win.classList.contains("maximized")) return;

        bringToFront(win);

        const rect = win.getBoundingClientRect();
        dragging = true;

        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        win.style.position = "absolute";
        win.style.left = `${startLeft}px`;
        win.style.top = `${startTop}px`;
        win.style.right = "auto";
        win.style.bottom = "auto";

        iframes.forEach((f) => (f.style.pointerEvents = "none"));

        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newLeft = startLeft + dx;
        let newTop = startTop + dy;

        const rect = win.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(
          0,
          window.innerHeight - TASKBAR_HEIGHT - rect.height
        );

        newLeft = clamp(newLeft, 0, maxLeft);
        newTop = clamp(newTop, 0, maxTop);

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
      });

      document.addEventListener("mouseup", () => {
        if (!dragging) return;
        dragging = false;
        iframes.forEach((f) => (f.style.pointerEvents = ""));
      });
    });
  }

  function updateNetworkBars() {
    if (!netEl) return;

    if (navigator.onLine) {
      netEl.textContent = "NET ▮▮▮▮";
      netEl.classList.add("is-online");
      netEl.classList.remove("is-offline");
      netEl.title = "Internet verbunden";
    } else {
      netEl.textContent = "NET ▯▯▯▯";
      netEl.classList.add("is-offline");
      netEl.classList.remove("is-online");
      netEl.title = "Keine Internetverbindung";
    }
  }

  window.addEventListener("online", updateNetworkBars);
  window.addEventListener("offline", updateNetworkBars);

  initOpenClose();
  initTabs();
  initClock();
  initDrag();
  updateNetworkBars();
})();
