# Property website

## Run it
1. Install Node.js (version 18 or newer).
2. In this folder run:  `ADMIN_PASSWORD=your-password node server.js`
   (Windows PowerShell: `$env:ADMIN_PASSWORD="your-password"; node server.js`)
3. Website: http://localhost:3000   Admin: http://localhost:3000/admin

## Admin
Log in at /admin to add, edit and delete properties and events, upload photos,
and change the website name and Messenger link. Changes show on the website immediately.

## Files
- index.html: the public page
- css/style.css, js/script.js: styling and page logic
- admin.html, js/admin.js: the admin page
- server.js: serves the site and saves admin changes (no packages to install)
- data/data.json: all properties, events and settings
- images/ and uploads/: photos (uploads/ holds photos added in admin)

## Hosting
Use a host that runs Node.js (Render, Railway, a VPS) and set ADMIN_PASSWORD there.
Keep the data/ and uploads/ folders on persistent storage, or admin changes can be lost on restart.
A static-only host (Netlify, GitHub Pages) shows the website but the admin will not work.

## Admin password
- First password: whatever you set in ADMIN_PASSWORD (or "changeme" if you set nothing).
- Change it any time in /admin: Settings, then Change password. The new password is stored
  (scrambled) in private/auth.json and replaces ADMIN_PASSWORD from then on.
- Emergency reset on the server: delete private/auth.json. The password goes back to ADMIN_PASSWORD.

## Forgot password: sign in with Google
Turn this on with four settings (environment variables):
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_EMAIL (the admin's Gmail), BASE_URL (the site's public address,
e.g. https://jkbhomerise.ph; leave empty on your own computer).
Get the ID and secret in Google Cloud Console: create a project, set up the OAuth consent screen, then
Credentials, Create credentials, OAuth client ID, Web application. Add this redirect URI:
BASE_URL/auth/google/callback  (for testing: http://localhost:3000/auth/google/callback).
Then /admin shows "Forgot password? Sign in with Google". Only ADMIN_EMAIL can use it, and it opens
Settings so a new password can be set without the old one.
Keep data/, uploads/ and private/ on persistent storage.

## Deploying on Vercel with GitHub (public site only)
Vercel cannot run the admin (it cannot save files), so there the website is static and you update it through GitHub.
1. Put this folder in a GitHub repository (make it private) and import it in Vercel (framework: Other, no build command).
2. Every time you push a change to GitHub, Vercel republishes the site in about a minute.
3. .vercelignore keeps the admin files off the live site. .gitignore keeps private/auth.json (your password) out of GitHub.

### Updating listings
Easiest: run the admin on your own computer (node server.js, open /admin), add or edit properties and events and upload photos,
then commit and push the changed data/data.json, images/ and uploads/ folders (GitHub Desktop or git).
By hand: edit data/data.json on github.com (pencil icon) and upload photos to images/ (Add file, Upload files).
Be careful with commas and quotes in data.json: one mistake empties the website. Past events hide by themselves.
