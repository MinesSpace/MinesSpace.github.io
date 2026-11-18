# MINES SPACE website

This repo contains the source files of the MINES SPACE website (https://minesspace.fr).
To modify something, please create a new branch, test locally, then merge into master.

## Structure

| Path | Content |
| --- | --- |
| `index.html` | French home page |
| `en/index.html` | English home page |
| `fr/ms0-result.html`, `fr/ms1-result.html` (+ `en/`) | Flight results of MARSAUT 0 and MARSAUT 1 |
| `css/main.css` | All styles (light and dark themes) |
| `js/main.js` | Interactions (theme, menu, mission sheets, carousel, contact form) |
| `js/analytics.js` | Google Analytics, loaded only after cookie consent |
| `js/flight-results.js` | Charts of the flight results pages |
| `assets/carrousel/` | Photos of the gallery carousel (see below) |
| `outils/` | Maintenance tools |

Other `fr/*.html` and `en/*.html` files are small redirects kept so that old links keep working.

## Updating the photo carousel

No code to touch: on GitHub, upload the photos into `assets/carrousel/`, named
`NN - Légende en français = English caption.jpg` (`NN` sets the order; the English part
after `=` is optional). The live site reads that folder directly through the GitHub API
(repository set in the `data-github` attribute of the carousel, in both `index.html`).
Full instructions: `assets/carrousel/LISEZ-MOI.txt`.

`assets/carrousel/photos.js` is only a fallback list (local preview, GitHub unavailable);
it can be refreshed with `outils/Mettre a jour le carrousel.bat` (requires Python 3).

## Projects (missions)

Each mission follows the same pattern in both `index.html` files (see the comment above the
Missions section): a card (patch, "Category · Campaign", name, team size) and a sheet
(The mission, Technical sheet with 6 fixed fields, Project team, Documents). Missing
information is written "Non communiqué" / "Not provided".

## Local preview

From this folder: `py -m http.server 8000`, then open http://localhost:8000.
