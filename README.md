# Trattoria — Restaurant (React)

**Live demo:** https://thothcher.github.io/restaurant-react/

A restaurant ordering front-end built with **React 19, Vite and React Router**, talking to the
[RestaurantAPI](https://restaurantapi.stepacademy.ge). The same app is also available as a
[vanilla JS version](https://github.com/thothcher/restaurant-vanilla-js).

## Features

- **Menu** — search, category chips, vegetarian toggle, spiciness, price range and minimum rating; "Load more" pagination; filters are kept in the URL so a filtered menu can be shared
- **Product page** — details, ingredients, preparation method, quantity picker, add to cart
- **Cart** — change quantity, remove items, checkout with confirmation
- **Accounts** — register, email verification (with resend), login, forgot / reset password, profile editing, change password, delete account
- **Validation** — live per-field validation and a password-requirements checklist (8+ chars, upper, lower, number, special character)
- **Design** — brand palette, max 4px corners, SVG icons, dark mode, custom scrollbars, parallax and [AOS](https://michalsnik.github.io/aos/) scroll animations, top-centre toasts
- **SEO** — per-route title / description / canonical / Open Graph, Product + Restaurant JSON-LD, `noindex` on private pages, `robots.txt` and `sitemap.xml`

## Tech

| Concern | Choice |
| --- | --- |
| UI | React 19 (hooks, no UI library) |
| Routing | React Router (History API, `basename` aware) |
| Build | Vite |
| State | tiny external store (`src/store.js`) via `useSyncExternalStore` |
| Forms | custom `useForm` hook + `src/validation.js` |
| Animations | AOS + a small parallax hook |

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

## Project structure

```
src/
  api/client.js       HTTP client: API key, bearer token, auto refresh, error normalising
  components/         Layout, Field, ProductCard, Toasts, ConfirmHost, Icon, bits
  hooks/              useForm, useSeo, useEffects (AOS + parallax), useAddToCart
  pages/              Home, Menu, Product, Cart, Auth (login/register/…), Profile
  store.js            auth tokens + cart count
  validation.js       field rules and password requirements
  styles.css          design tokens and all styles
```

## Configuration

The API base URL and key live in [`src/config.js`](src/config.js).

> The API key is a browser-side key for a training API. Don't reuse this pattern for real secrets —
> anything shipped to the browser can be read by users.

## Deployment (GitHub Pages)

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the
app and publishes `dist/` to GitHub Pages.

GitHub Pages has no single-page-app fallback, so:

- `vite.config.js` sets `base: '/restaurant-react/'` for production builds, and `main.jsx` passes it to the router as `basename`.
- `public/404.html` redirects unknown paths to `index.html`, and a small script in `index.html` restores the original URL
  (the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) technique), so deep links and refreshes work.

To deploy under a different repository name, change the `base` value in `vite.config.js`
(and the URLs in `public/sitemap.xml` / `public/robots.txt`).
