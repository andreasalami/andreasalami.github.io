(() => {
  "use strict";

  const stickyMenu = document.querySelector(".sticky-menu");
  const topBar = document.querySelector(".top-bar");
  const menuToggle = document.querySelector(".menu-toggle-label");
  const menuLinks = document.querySelectorAll(".menu-items a");
  const glassSurfaces = document.querySelectorAll(".liquid-glass");
  let closeTimer;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Gooey filter: blur + alpha threshold fuses nearby blobs into liquid necks.
  document.body.insertAdjacentHTML(
    "beforeend",
    '<svg class="goo-defs" aria-hidden="true" focusable="false"><filter id="goo">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="6"/>' +
      '<feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>' +
      "</filter></svg>"
  );
  const gooLayer = (className, blobs) =>
    `<span class="${className}" aria-hidden="true">${"<i></i>".repeat(blobs)}</span>`;

  if (topBar) {
    topBar.insertAdjacentHTML("beforeend", gooLayer("bar-goo", 3));
    // Touch screens: the pill starts from the previous page's state (home keeps the logo pop),
    // then after the first paint it moves to the current page's drop.
    let fromState;
    try {
      const previous = new URL(document.referrer);
      if (previous.origin === location.origin && !topBar.querySelector('.logo [aria-current="page"]')) {
        fromState = { "curriculum.html": "from-cv", "form.html": "from-all" }[previous.pathname.split("/").pop()];
      }
    } catch {
      // No referrer (typed URL, bookmark): start from rest.
    }
    if (fromState) {
      topBar.classList.add(fromState);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      topBar.classList.remove("from-cv", "from-all");
      topBar.classList.add("is-arrived");
    }));
  }

  // iOS Safari only applies :active (the touch press effect) when a touch listener exists.
  document.addEventListener("touchstart", () => {}, { passive: true });

  if (stickyMenu) {
    stickyMenu.insertAdjacentHTML("beforeend", gooLayer("menu-goo", 4));
  }

  if (!stickyMenu || !menuToggle) {
    return;
  }

  const setMenuState = (isOpen) => {
    window.clearTimeout(closeTimer);

    if (isOpen) {
      stickyMenu.classList.remove("is-closing");
      stickyMenu.classList.add("is-open");
    } else if (stickyMenu.classList.contains("is-open")) {
      stickyMenu.classList.add("is-closing");
      window.requestAnimationFrame(() => {
        stickyMenu.classList.remove("is-open");
      });
      closeTimer = window.setTimeout(() => {
        stickyMenu.classList.remove("is-closing");
      }, 520);
    }

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  };

  menuToggle.addEventListener("click", () => {
    setMenuState(!stickyMenu.classList.contains("is-open"));
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (!stickyMenu.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && stickyMenu.classList.contains("is-open")) {
      setMenuState(false);
      menuToggle.focus();
    }
  });

  glassSurfaces.forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      surface.style.setProperty("--glass-x", `${x}%`);
      surface.style.setProperty("--glass-y", `${y}%`);
    });

    surface.addEventListener("pointerleave", () => {
      surface.style.setProperty("--glass-x", "50%");
      surface.style.setProperty("--glass-y", "0%");
    });
  });
})();
