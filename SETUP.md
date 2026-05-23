# הגדרת MyOS — מדריך מהיר

## שלב 1: Supabase

1. כנסי ל-[supabase.com](https://supabase.com) וצרי פרויקט חדש
2. לאחר יצירת הפרויקט: Settings → API → העתיקי:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
3. פתחי SQL Editor בסופרבייס → הדביקי את כל תוכן `supabase/schema.sql` → לחצי Run
4. Authentication → Providers → Google → הפעילי (צריך OAuth credentials מ-Google Cloud Console)

## שלב 2: .env.local

ערכי את הקובץ `.env.local` בתיקיית הפרויקט:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

## שלב 3: הפעלה

```bash
npm run dev
```

פתחי http://localhost:3000

## Google OAuth (להתחברות)

1. כנסי ל-[console.cloud.google.com](https://console.cloud.google.com)
2. צרי פרויקט חדש (או השתמשי בקיים)
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Authorized redirect URIs: `https://<project>.supabase.co/auth/v1/callback`
5. העתיקי Client ID + Secret → Supabase → Auth → Google
