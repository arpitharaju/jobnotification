(function () {
  "use strict";

  const KNOWN_ROUTES = ["dashboard", "saved", "digest", "settings", "proof"];

  const NOT_FOUND_TITLE = "Page Not Found";
  const NOT_FOUND_SUBTEXT = "The page you are looking for does not exist.";

  function normalizeRouteSegment(segment) {
    const s = (segment || "").toLowerCase();
    if (!s) return null;
    if (s.endsWith(".html")) return s.slice(0, -5);
    return s;
  }

  function getRequestedRoute() {
    const parts = window.location.pathname.split("/").filter(Boolean).map(normalizeRouteSegment);
    for (let i = 0; i < parts.length; i++) {
      if (KNOWN_ROUTES.includes(parts[i])) return parts[i];
    }
    return null;
  }

  function getRequestedView() {
    const route = getRequestedRoute();
    if (route) return { kind: "route", route };

    const segments = window.location.pathname.split("/").filter(Boolean);
    // Heuristic: GitHub Pages repo base typically adds one path segment.
    // If there is more than that and no known route was found, show 404.
    if (segments.length > 1) return { kind: "not-found" };

    return { kind: "landing" };
  }

  function updateActiveNav(route) {
    const links = document.querySelectorAll('a.nav-link[data-route="dashboard"], a.nav-link[data-route="saved"], a.nav-link[data-route="digest"], a.nav-link[data-route="settings"], a.nav-link[data-route="proof"]');
    links.forEach((a) => {
      const isActive = a.getAttribute("data-route") === route;
      a.classList.toggle("is-active", isActive);
    });
  }

  function renderView(view) {
    const container = document.querySelector("[data-app-view]");
    if (!container) return;

    if (view.kind === "not-found") {
      container.innerHTML = `
        <h1 class="route-title">${NOT_FOUND_TITLE}</h1>
        <p class="route-subtitle">${NOT_FOUND_SUBTEXT}</p>
      `;
      updateActiveNav(null);
      return;
    }

    if (view.kind === "landing") {
      container.innerHTML = `
        <h1 class="route-title">Stop Missing The Right Jobs.</h1>
        <p class="route-subtitle">Precision-matched job discovery delivered daily at 9AM.</p>
        <div class="route-cta">
          <a class="ds-btn ds-focusable ds-btn--primary" href="./settings/" data-route="settings">Start Tracking</a>
        </div>
      `;
      updateActiveNav(null);
      return;
    }

    // Known routes
    switch (view.route) {
      case "dashboard":
        container.innerHTML = `
          <div class="route-empty" role="status" aria-label="Dashboard empty state">
            <h2 class="route-empty-title">No jobs yet. In the next step, you will load a realistic dataset.</h2>
          </div>
        `;
        updateActiveNav("dashboard");
        return;
      case "saved":
        container.innerHTML = `
          <div class="route-empty" role="status" aria-label="Saved empty state">
            <h2 class="route-empty-title">No saved jobs yet</h2>
            <p class="route-empty-text">Save jobs to review them later. No data yet.</p>
          </div>
        `;
        updateActiveNav("saved");
        return;
      case "digest":
        container.innerHTML = `
          <div class="route-empty" role="status" aria-label="Digest empty state">
            <h2 class="route-empty-title">Daily summary coming soon</h2>
            <p class="route-empty-text">A premium daily digest will appear here. No digest yet.</p>
          </div>
        `;
        updateActiveNav("digest");
        return;
      case "settings":
        container.innerHTML = `
          <div class="ds-card" aria-label="Settings placeholder">
            <h1 class="route-title">Settings</h1>
            <div class="route-form">
              <label class="ds-field" for="role-keywords">
                <span class="ds-label">Role keywords</span>
                <input id="role-keywords" class="ds-input ds-focusable" placeholder="e.g., frontend engineer, product manager" />
              </label>

              <label class="ds-field" for="preferred-locations">
                <span class="ds-label">Preferred locations</span>
                <input id="preferred-locations" class="ds-input ds-focusable" placeholder="e.g., Remote, New York, London" />
              </label>

              <label class="ds-field" for="mode">
                <span class="ds-label">Mode</span>
                <select id="mode" class="ds-input ds-focusable" aria-label="Mode">
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </label>

              <label class="ds-field" for="experience-level">
                <span class="ds-label">Experience level</span>
                <input id="experience-level" class="ds-input ds-focusable" placeholder="e.g., 3-5 years" />
              </label>
            </div>
          </div>
        `;
        updateActiveNav("settings");
        return;
      case "proof":
        container.innerHTML = `
          <h1 class="route-title">Proof</h1>
          <p class="route-subtitle">Artifact collection for verification will be available in the next step.</p>
        `;
        updateActiveNav("proof");
        return;
      default:
        container.innerHTML = `
          <h1 class="route-title">${NOT_FOUND_TITLE}</h1>
          <p class="route-subtitle">${NOT_FOUND_SUBTEXT}</p>
        `;
        updateActiveNav(null);
        return;
    }
  }

  function setHamburgerState(isOpen) {
    const panel = document.querySelector("[data-nav-panel]");
    const burger = document.querySelector("[data-nav-burger]");
    if (!panel || !burger) return;
    panel.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function initNavHandlers() {
    const burger = document.querySelector("[data-nav-burger]");
    if (burger) {
      burger.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = burger.getAttribute("aria-expanded") === "true";
        setHamburgerState(!isOpen);
      });
    }

    // Intercept all internal navigation clicks to avoid full reloads.
    const spaLinks = document.querySelectorAll('a[data-route="dashboard"], a[data-route="saved"], a[data-route="digest"], a[data-route="settings"], a[data-route="proof"]');
    spaLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const route = a.getAttribute("data-route");
        if (!route) return;

        const currentRoute = getRequestedRoute();
        if (currentRoute === route) {
          e.preventDefault();
          setHamburgerState(false);
          return;
        }

        e.preventDefault();

        const href = a.getAttribute("href") || "";
        const targetUrl = new URL(href, window.location.href);
        window.history.pushState({}, "", `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`);

        setHamburgerState(false);
        renderView({ kind: "route", route });
      });
    });

    // Close menu if user taps outside.
    document.addEventListener("click", (e) => {
      const burgerEl = document.querySelector("[data-nav-burger]");
      const panelEl = document.querySelector("[data-nav-panel]");
      if (!burgerEl || !panelEl) return;

      const isOpen = burgerEl.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;

      const target = e.target;
      if (target instanceof Node && panelEl.contains(target)) return;
      if (target instanceof Node && burgerEl.contains(target)) return;

      setHamburgerState(false);
    });
  }

  function init() {
    initNavHandlers();

    // Initial render based on the current URL path.
    renderView(getRequestedView());

    // Support back/forward navigation.
    window.addEventListener("popstate", () => {
      renderView(getRequestedView());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

