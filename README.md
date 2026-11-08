# JKB Homerise PH property website

Static website (Vercel) with an admin page backed by Supabase.

- Setup and handover: **SETUP-SUPABASE.md** (run `supabase-setup.sql` once)
- Public page: index.html, css/style.css, js/script.js
- Admin page: admin.html at /admin, js/admin.js
- Supabase keys: js/config.js (public keys only)
- Starting content (used until the first admin save): data/data.json
- Colors: top of css/style.css (--bg, --ink, --accent, --dk, --dk2)
- Hero slides, properties, events, photos, name and portrait are all edited in /admin.

To preview on your computer: open this folder in a terminal and run `npx serve` (or any static server), then open /admin.html.
