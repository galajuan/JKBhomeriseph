# Admin setup with Supabase (do this once)

How it works: the website and the admin page talk straight to your Supabase project.
Supabase handles the login, the "forgot password" email and the photo storage.
Only emails listed in the `admins` table can change anything.

## 1. Create the tables, rules and photo bucket
1. Supabase dashboard > **SQL Editor** > New query.
2. Paste everything from `supabase-setup.sql` (skip the last commented line) and click **Run**.

## 2. Create the admin login
1. **Authentication > Users > Add user > Create new user**.
2. Enter the owner's email and a temporary password. Tick **Auto Confirm User**.
3. **SQL Editor** > new query, run (use the same email):
   `insert into public.admins (email) values ('owner@gmail.com');`

## 3. Lock the door to strangers
- **Authentication > Sign In / Providers** (or Settings): turn **off** "Allow new users to sign up".
  (Even if left on, strangers cannot change anything, but turn it off anyway.)

## 4. Allow the reset link to come back to your site
- **Authentication > URL Configuration**
  - **Site URL**: `https://YOUR-LIVE-ADDRESS`
  - **Redirect URLs**: add `https://YOUR-LIVE-ADDRESS/admin`

## 5. Connect the website
1. **Project Settings > API**. Copy the **Project URL** and the **anon / publishable** key.
2. Paste both into `js/config.js`. (Never use the `service_role` / secret key.)
3. Push to GitHub. Vercel republishes in about a minute.

## 6. Hand over to the owner
1. Send him `https://YOUR-LIVE-ADDRESS/admin`, his email and the temporary password (privately).
2. He logs in and goes to **Settings > Change password**.
3. If he forgets it: login page > **Forgot password?** > he types his email, gets a link, sets a new one.

## Important: reset emails
Supabase's built-in email sender is limited. It only sends to people who are members of your Supabase organization
and is rate-limited (a few emails per hour). For the owner to receive reset emails you can either:
- invite his email to your Supabase organization (Organization > Team), or
- set up your own email sender: **Project Settings > Authentication > SMTP Settings** (Resend or Brevo have free plans).

Until then, you can always reset his password yourself: **Authentication > Users > his row > Send password recovery** or
delete and re-add the user.

## Good to know
- Free Supabase projects pause after about a week of no activity. The public site still shows the last saved
  copy in `data/data.json`, but the admin will not work until you click **Restore** in the dashboard.
  Logging in to admin or visiting the site now and then keeps it awake.
- After the first save in the admin, the live site reads from Supabase. `data/data.json` becomes just the
  starting copy and editing it no longer changes the live site.
- Photos are resized before upload (max about 1600 px).
