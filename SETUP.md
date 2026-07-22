# JMT Systems secure setup

## 1. Create the database tables

In Supabase, go to **SQL Editor**, create a new query, paste everything from `supabase-schema.sql`, and click **Run**. Do not change the administrator email in the file unless you want a different administrator.

## 2. Set the login redirect URL

In **Authentication → URL Configuration**, add the final website address followed by `/admin.html` to the Redirect URLs list. For a local test using this folder, use the address served by your web host (not `file:///`).

## 3. Test the dashboard

Open `admin.html`, enter the email link received at `ababiofrederick3639@gmail.com`, and then review project requests. No password is stored by JMT; Supabase sends a temporary sign-in link.

## 4. Connect Paystack later

Do not place Paystack secret keys in these static files. The live Paystack connection needs a small server-side function, which will be added when the merchant account is approved. It will verify every payment before a registration is marked as paid.
