(function () {
  "use strict";

  const KNOWN_ROUTES = ["dashboard", "saved", "digest", "settings", "proof"];

  const PLACEHOLDER_SUBTEXT = "This section will be built in the next step.";
  const NOT_FOUND_TITLE = "Page Not Found";
  const NOT_FOUND_SUBTEXT = "The page you are looking for does not exist.";

  function getRouteFromPathname() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;

    const last = parts[parts.length - 1] || "";
    const lastIsHtml = last.toLowerCase().endsWith(".html");
    if (lastIsHtml && KNOWN_ROUTES.includes(last.toLowerCase().replace(".html", ""))) {
      // Unlikely, but keep the logic robust.
      return last.toLowerCase().replace(".html", "");
    }
    if (lastIsHtml) return null;

    const normalized = parts.map((p) => p.toLowerCase());
    for (let i = normalized.length - 1; i >= 0; i--) {
      if (KNOWN_ROUTES.includes(normalized[i])) return normalized[i];
    }
    return null;
  }

  function getBasePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";

    const normalized = parts.map((p) => p.toLowerCase());
    const last = normalized[normalized.length - 1];
    const lastIsHtml = last.endsWith(".html");

    if (KNOWN_ROUTES.includes(last)) {
      parts.pop();
    } else if (lastIsHtml) {
      parts.pop();
    }

    return "/" + parts.join("/");
  }

  function routeTitle(route) {
    switch (route) {
      case "dashboard":
        return "Dashboard";
      case "saved":
        return "Saved";
      case "digest":
        return "Digest";
      case "settings":
        return "Settings";
      case "proof":
        return "Proof";
      default:
        return null;
    }
  }

  function updateActiveNav(route) {
    const links = document.querySelectorAll('a[data-route="dashboard"], a[data-route="saved"], a[data-route="digest"], a[data-route="settings"], a[data-route="proof"]');
    links.forEach((a) => {
      const isActive = a.getAttribute("data-route") === route;
      a.classList.toggle("is-active", isActive);
    });
  }

  function renderPlaceholder(route) {
    const titleEl = document.querySelector("[data-route-title]");
    const subtitleEl = document.querySelector("[data-route-subtitle]");

    if (!titleEl || !subtitleEl) return;

    if (!route) {
      titleEl.textContent = NOT_FOUND_TITLE;
      subtitleEl.textContent = NOT_FOUND_SUBTEXT;
      updateActiveNav(null);
      return;
    }

    const title = routeTitle(route);
    titleEl.textContent = title || NOT_FOUND_TITLE;
    subtitleEl.textContent = PLACEHOLDER_SUBTEXT;
    updateActiveNav(route);
  }

  function setHamburgerState(isOpen) {
    const panel = document.querySelector("[data-nav-panel]");
    const burger = document.querySelector("[data-nav-burger]");
    if (!panel || !burger) return;
    panel.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function toPath(route) {
    const base = getBasePath();
    // base ends up like "/jobnotification" (no trailing slash)
    return `${base}/${route}/`;
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
    // Intercept all nav link clicks (desktop + mobile) to avoid full reloads.
    const navLinks = document.querySelectorAll('a[data-route="saved"], a[data-route="digest"], a[data-route="settings"], a[data-route="proof"]');
    navLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const route = a.getAttribute("data-route");
        if (!route) return;

        const currentRoute = getRouteFromPathname();
        if (currentRoute === route) {
          setHamburgerState(false);
          return;
        }

        window.history.pushState({}, "", toPath(route));
        setHamburgerState(false);
        renderPlaceholder(route);
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
    const route = getRouteFromPathname();
    renderPlaceholder(route);

    // Support back/forward navigation.
    window.addEventListener("popstate", () => {
      const r = getRouteFromPathname();
      renderPlaceholder(r);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

