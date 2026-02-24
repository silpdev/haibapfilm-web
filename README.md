# HaiBapFilm Web

A modern movie streaming web app built with **Next.js 14**, consuming the [OPhim](https://ophim1.com) API. Companion web version of the HaiBapFilm Android TV/Mobile app.

## Features

- Browse movies — new releases, series, singles, animation, TV shows
- Search by title with pagination
- HLS video player (hls.js) with iframe embed fallback
- Multi-server & multi-episode selector
- Favorites & watch history with resume position
- **Account sync** — sign in with Google or email magic link to sync history, favorites, and progress across devices (Supabase)
- Guest mode — everything works without signing in (localStorage)
- Fully responsive — mobile, tablet, desktop
- Docker-ready with standalone output
- Designed to run behind Nginx Proxy Manager with SSL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Video | hls.js + iframe embed fallback |
| Storage | localStorage (guest) + Supabase (signed in) |
| Auth | Supabase Auth (Google OAuth + Email magic link) |
| API | [ophim1.com](https://ophim1.com) REST API |
| Container | Docker (multi-stage, node:18-alpine) |
| Proxy | Nginx Proxy Manager |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero banner + newest movies |
| `/danh-sach/[type]` | Movie list by type |
| `/movie/[slug]` | Movie detail — poster, info, cast, episode list |
| `/watch/[slug]` | Video player — HLS stream, server/episode switcher |
| `/search?q=...` | Search results with pagination |
| `/the-loai/[slug]` | Filter by genre |
| `/history` | Watch history with progress bars |
| `/favorites` | Saved favorites |
| `/auth/callback` | OAuth / magic-link exchange route |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/silpdev/haibapfilm-web.git
cd haibapfilm-web
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Production Deployment (Docker + Nginx Proxy Manager)

### Step 1 — Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
-- Watch progress
create table watch_progress (
  user_id      uuid references auth.users not null,
  movie_slug   text not null,
  episode_slug text not null,
  position_ms  bigint not null default 0,
  duration_ms  bigint not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, movie_slug, episode_slug)
);
alter table watch_progress enable row level security;
create policy "Users manage own progress" on watch_progress
  for all using (auth.uid() = user_id);

-- Favorites (soft-delete via deleted_at)
create table favorites (
  user_id    uuid references auth.users not null,
  movie_slug text not null,
  title      text,
  poster_url text,
  added_at   timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, movie_slug)
);
alter table favorites enable row level security;
create policy "Users manage own favorites" on favorites
  for all using (auth.uid() = user_id);

-- Watch history
create table watch_history (
  user_id      uuid references auth.users not null,
  movie_slug   text not null,
  episode_slug text not null,
  title        text,
  poster_url   text,
  watched_at   timestamptz not null default now(),
  primary key (user_id, movie_slug, episode_slug)
);
alter table watch_history enable row level security;
create policy "Users manage own history" on watch_history
  for all using (auth.uid() = user_id);
```

3. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: `https://film.yourdomain.com`
   - **Redirect URLs**: `https://film.yourdomain.com/auth/callback`

### Step 2 — Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create **OAuth 2.0 Client ID** → type: **Web application**
3. Add to **Authorized redirect URIs**:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://film.yourdomain.com/auth/callback`
4. Copy the **Client ID** and **Client Secret**
5. In Supabase → **Authentication** → **Providers** → **Google**: paste Client ID + Secret, enable

### Step 3 — Environment file

Create `/home/silp/movie-webapp/.env` (read by docker-compose, never committed):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://film.yourdomain.com
```

### Step 4 — Start the container

```bash
cd /home/silp/movie-webapp
docker-compose up -d --build
```

### Step 5 — Add Proxy Host in Nginx Proxy Manager (`http://your-server:81`)

| Field | Value |
|-------|-------|
| Domain Names | `film.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname | `haibapfilm-web` |
| Forward Port | `3000` |
| Block Common Exploits | enabled |

In the **SSL** tab: Request Let's Encrypt certificate, enable Force SSL + HTTP/2.

### Step 6 — Fix Nginx proxy buffer for JWT cookies (required)

Supabase sets large JWT session cookies on the `/auth/callback` response. Nginx's default `proxy_buffer_size` (4 KB) is too small, causing **502 Bad Gateway**. Fix by creating a custom Nginx config:

```bash
mkdir -p /home/silp/data/nginx/custom
cat > /home/silp/data/nginx/custom/server_proxy.conf << 'EOF'
proxy_buffer_size          32k;
proxy_buffers              8 16k;
proxy_busy_buffers_size    64k;
EOF
```

Then reload Nginx inside the NPM container:

```bash
docker exec npm nginx -s reload
```

> This file is bind-mounted inside NPM at `/data/nginx/custom/server_proxy.conf` and persists across NPM restarts. The proxy host config already includes it via glob.

---

## Rebuild after code changes

```bash
cd /home/silp/movie-webapp
git pull
docker-compose down && docker-compose up -d --build
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL of the site (used for OAuth redirect) |

> Variables are passed as Docker **build args** (baked into client bundle) AND **runtime env vars** (for server-side route handlers). Both are needed.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout + AuthProvider
│   ├── auth/callback/route.ts    # OAuth / magic-link exchange
│   ├── history/                  # Watch history
│   └── favorites/                # Favorites
├── components/
│   ├── Navbar.tsx                # Sync icon / avatar dropdown
│   └── LoginModal.tsx            # Sign-in modal (Google + email)
├── context/
│   └── AuthContext.tsx           # Auth state + merge-on-login
└── lib/
    ├── storage.ts                # localStorage + Supabase push on write
    ├── syncStorage.ts            # Merge logic + incremental push helpers
    └── supabase.ts               # Browser Supabase client singleton
```

---

## License

MIT
