# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Andrea Salami's personal static site, published with GitHub Pages from `main` at https://andreasalami.github.io (repo `andreasalami/andreasalami.github.io`). It has no package manager, bundler, tests or CI: just three hand-written HTML pages (`index.html`, `curriculum.html`, `form.html`), two Sass stylesheets, one vanilla JS file, and `images/`. When you merge to `main`, the change goes live.

## Commands

- Preview: serve the repo root with any static server. VS Code Live Server is configured on port 5501 (`.vscode/settings.json`). Pages use absolute paths such as `/images/favicon.svg`, so serve from the root instead of opening files with `file://`.
- Sass: there is a single source, `styles.scss`. Edit it, then regenerate and commit `styles.css` + `styles.css.map`. Never edit `styles.css` by hand. The committed CSS uses the expanded style of the VS Code Live Sass Compiler (dart-sass). The global `sass` on this machine is Ruby Sass 3.7.4, which is deprecated and formats its output differently, so the diff would be noisy. Don't use it.

## Architecture

- **`styles.scss` has two sections, in cascade order:**
  1. The original base layout. It defines Sass variables (`$primary-color`, `$text-color`, …) and mixins such as `flex-center` and `button-style`.
  2. The "liquid glass" redesign, starting at the `LIQUID GLASS` banner comment. It overrides many base rules: identical selectors win only because they come later. Moving rules across the banner changes the rendering.
- **Page scoping:** every rule in the liquid glass section is scoped by a class on `<body>`:
  - `.home-page` on all pages;
  - plus `.curriculum-page` or `.form-page` on those two pages.

  Keep new rules scoped the same way. Design tokens live in `:root` as `--glass-*` custom properties, and the `glass-surface` mixin is applied to elements with the `.liquid-glass` class.
- **Shared markup, copied by hand:** the top bar (`nav.top-bar`), the floating menu (`.sticky-menu`) and the social footer (`nav.bottom-bar`) are duplicated in every page. A change to one of them must be made in all three HTML files, keeping `aria-current="page"` on the right link.
- **`liquid-glass.js`** is loaded with `defer` after Lucide from unpkg. It:
  - calls `lucide.createIcons()`: icons are written as `<i class="bi …" data-lucide="…">` and Bootstrap Icons is the fallback if Lucide doesn't load;
  - injects the SVG `#goo` filter and the `.bar-goo`/`.menu-goo` blob layers that the CSS animates;
  - toggles the sticky menu with the `is-open`/`is-closing` classes. The 520 ms close timer must stay in step with the CSS close animation;
  - writes the `--glass-x`/`--glass-y` custom properties from the pointer position.
- **External libraries come from CDNs only:** Bootstrap 5.3.3 CSS, Bootstrap Icons, Font Awesome 6.7.2 (loaded with SRI), Google Fonts Roboto, Lucide 1.27.0, and EmailJS.

## Contact form (EmailJS)

The logic is in the inline `<script>` at the bottom of `form.html`. It uses `emailjs-com@3`, which is deprecated in favour of `@emailjs/browser`.

- `emailjs.init(<public key>)` uses a key that is public by design.
- `sendForm(serviceId, "contact_form", form)` sends the form. The service ID is the Gmail address of the EmailJS Gmail service.
- The EmailJS template depends on the field names `user_name`, `user_email` and `message`. Don't rename them.
- When the site reports "Error sending message.", look at the EmailJS dashboard before the code. For example, `412 Gmail_API: Invalid grant` means Google revoked the authorization: reconnect the Gmail service and grant the "Send email on your behalf" permission.

## SEO conventions

Each page has a `<title>`, a meta description, a canonical URL, and Open Graph/Twitter tags pointing to `https://andreasalami.github.io/...`. `index.html` also contains JSON-LD. If you add or rename a page, update `sitemap.xml` and `robots.txt` too.

## Workflow

Recent work follows GitHub Flow: a feature branch, a pull request into `main` (PRs #1–#4), and Conventional Commit messages, e.g. `style(nav): …` or `feat: …`.
