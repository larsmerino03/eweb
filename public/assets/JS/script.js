// assets/js/script.js
// Open/Close windows + Tabs + Clock + Drag + Taskbar window buttons (minimize/switch)

(() => {
  "use strict";

  let topZ = 10;
  const taskbarContainer = document.getElementById("taskbar-windows");

  function bringToFront(win) {
    topZ += 1;
    win.style.zIndex = String(topZ);
    setActiveTaskbarButton(win.id);
  }

  function setActiveTaskbarButton(windowId) {
    document.querySelectorAll(".taskbar-window-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.taskbar === windowId);
    });
  }

  function createTaskbarButton(win) {
    if (!taskbarContainer) return;

    const id = win.id;

    // schon vorhanden?
    if (taskbarContainer.querySelector(`[data-taskbar="${id}"]`)) return;

    const btn = document.createElement("button");
    btn.className = "taskbar-window-btn";
    btn.dataset.taskbar = id;

    // passendes Desktop Icon suchen
    const desktopIcon = document.querySelector(`[data-open="${id}"] img`);

    if (desktopIcon) {
      const icon = document.createElement("img");
      icon.src = desktopIcon.src;
      icon.className = "taskbar-window-icon";
      btn.appendChild(icon);
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

    // Important: if window was positioned with right/bottom in CSS, convert to left/top once
    const rect = win.getBoundingClientRect();
    win.style.position = "absolute";
    win.style.left = `${rect.left}px`;
    win.style.top = `${rect.top}px`;
    win.style.right = "auto";
    win.style.bottom = "auto";
  }

  function minimizeWindow(win) {
    win.classList.remove("is-open");
    win.setAttribute("aria-hidden", "true");

    // Remove active highlight
    const btn = document.querySelector(
      `.taskbar-window-btn[data-taskbar="${win.id}"]`
    );
    if (btn) btn.classList.remove("active");
  }

  function closeWindow(win) {
    // Close via X: remove window + remove taskbar button
    win.classList.remove("is-open");
    win.setAttribute("aria-hidden", "true");
    removeTaskbarButton(win);
  }

  function initOpenClose() {
    // Open via icons
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

    // Close via X
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const win = btn.closest(".window");
        if (!win) return;
        closeWindow(win);
      });
    });

    // Click in window -> bring to front
    document.querySelectorAll(".window").forEach((win) => {
      win.addEventListener("mousedown", () => {
        // only if it's visible/open
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
        if (e.button !== 0) return; // left mouse only
        if (!win.classList.contains("is-open")) return;
        if (e.target.closest("[data-close]")) return;

        bringToFront(win);

        const rect = win.getBoundingClientRect();
        dragging = true;

        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        // ensure left/top positioning
        win.style.position = "absolute";
        win.style.left = `${startLeft}px`;
        win.style.top = `${startTop}px`;
        win.style.right = "auto";
        win.style.bottom = "auto";

        // prevent iframe from stealing mousemove while dragging
        iframes.forEach((f) => (f.style.pointerEvents = "none"));

        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        win.style.left = `${startLeft + dx}px`;
        win.style.top = `${startTop + dy}px`;
      });

      document.addEventListener("mouseup", () => {
        if (!dragging) return;
        dragging = false;

        // restore iframe interaction
        iframes.forEach((f) => (f.style.pointerEvents = ""));
      });
    });
  }

  // Run
  initOpenClose();
  initTabs();
  initClock();
  initDrag();
})();

function updateNetworkBars() {
  const el = document.getElementById("net-status");
  if (!el) return;

  if (navigator.onLine) {
    el.textContent = "NET ▮▮▮▮";
    el.classList.add("is-online");
    el.classList.remove("is-offline");

    el.title = "Internet verbunden";
  } else {
    el.textContent = "NET ▯▯▯▯";
    el.classList.add("is-offline");
    el.classList.remove("is-online");

    el.title = "Keine Internetverbindung";
  }
}

window.addEventListener("online", updateNetworkBars);
window.addEventListener("offline", updateNetworkBars);

updateNetworkBars();
