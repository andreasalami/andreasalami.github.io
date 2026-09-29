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
    // Enables the re-absorb flash only after a first opening, never on page load.
    const markOpened = () => topBar.classList.add("has-opened");
    topBar.addEventListener("pointerenter", markOpened, { once: true });
    topBar.addEventListener("focusin", markOpened, { once: true });
  }

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
