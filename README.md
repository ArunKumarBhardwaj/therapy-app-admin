# Therapy App

Two apps. One Supabase backend.

`admin` is the public marketing site and the hidden CMS. Start here.

`mobile` is the Expo app. Empty until the CMS can upload services.

## Layout

```
admin/      Next.js landing + /admin CMS
mobile/     Expo SDK 57 (later)
supabase/   SQL migrations shared by both apps
```

## First run

1. Create a Supabase project.
2. Run `supabase/001_init.sql` in the SQL editor.
3. Copy `admin/.env.example` to `admin/.env.local`.
4. `cd admin && bun install && bun run dev`
