# Notion Static Site

Pure HTML/CSS/JS — no React, no Tailwind, no build step.

## Deploy
Upload the entire folder to any static host (Netlify, Cloudflare Pages,
GitHub Pages, S3, nginx, etc.). Or preview locally:

```
python3 -m http.server 8080
```

Then open http://localhost:8080

## Structure
- `index.html`, `dashboard.html`, `login.html`, ... — pages
- `saas/` — CSS, JS, fonts, and images
- `_redirects` — pretty-URL rules for Netlify / Cloudflare Pages
- `404.html` — fallback for unmatched routes
