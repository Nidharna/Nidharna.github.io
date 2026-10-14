# An Aquarium for Things That Don't Exist

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it
- Open `index.html` in a browser, or
- In VS Code, right-click `index.html` and choose "Open with Live Server", or
- From this folder run `python3 -m http.server 8000` and visit http://localhost:8000

## Files
- `index.html`  page structure and the font links
- `style.css`   colours (CSS variables at the top), layout and the notes sheet and tray
- `script.js`   the creatures, ink drops, hush, and field notes

## Easy edits
- Colours: `--blue`, `--pink`, `--yellow`, `--water` at the top of `style.css`. The canvas ink colours are `INK`, `SEC` and `WATER` near the top of `script.js`.
- Notes text: the `NOTES` array in `script.js`.
- Creature speed and size: the numbers inside each update and draw block in `script.js`.

## Publish
Upload the folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).
