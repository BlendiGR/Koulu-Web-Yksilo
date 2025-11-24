# School Project – Mitä Syötäväksi?

A second-year ICT **Ohjelmistotuotanto** school project built to for hunting menus from school restaurants. This app puts everything in one place, nearby restaurants, filters that actually matter, and daily/weekly menus.

## Purpose

- Make it easy to find the closest restaurant around campus or your city.
- Show daily and weekly menus side by side so the choice is quick.
- Keep it lightweight: simple filters, a clear map, and favorites when logged in.

## Folder Structure

- `index.html` – Public landing with the map, restaurant list, and search.
- `pages/` – HTML views for the app, login, register, and profile.
- `js/` – Front-end logic in ES modules.
  - `api/` – Fetch helpers for auth, restaurants, and user data.
  - `components/` – Map, restaurant cards, auth guard, and shared UI bits.
  - `pages/` – Controllers for home, app, login, register, and profile.
- `css/` – Global styles plus component and page-specific styles.
- `public/` – Static assets (logo, background, avatars).

## Main Features

- Restaurant list that surfaces nearby options and highlights favorites for signed-in users.
- Filters and search by city, company, or free text; results reorder by proximity when your location is known.
- Map view (Google Maps) that plots restaurants, shows info windows, and centers on your picked spot.
- Menu viewer per restaurant with Daily and Weekly tabs.

## Tech Used

- HTML, CSS, and vanilla JavaScript modules.
- Google Maps JavaScript components for maps and markers.
- `geolib` for distance calculations.
- Fetch-based API layer for restaurants, menus, users, and auth.
