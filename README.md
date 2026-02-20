# HaiBapFilm Web

A modern movie streaming web app built with **Next.js 14**, consuming the [OPhim](https://ophim1.com) API. Companion web version of the HaiBapFilm Android TV/Mobile app.

## Features

- 🎬 Browse movies — new releases, series, singles, animation, TV shows
- 🔍 Search by title with pagination
- 🎥 HLS video player (hls.js) with iframe embed fallback
- 📺 Multi-server & multi-episode selector
- ❤️ Favorites — saved in browser localStorage
- 🕐 Watch history with resume position and progress bar
- 📱 Fully responsive — mobile, tablet, desktop
- ⚡ Server-side rendering via Next.js App Router
- 🐳 Docker-ready with standalone output (~148 MB image)
- 🔒 Designed to run behind Nginx Proxy Manager with SSL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Video | hls.js + iframe embed fallback |
| Storage | Browser localStorage (history, favorites, progress) |
| API | [ophim1.com](https://ophim1.com) REST API |
| Container | Docker (multi-stage, node:18-alpine) |
| Proxy | Nginx Proxy Manager |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero banner + newest movies |
| `/danh-sach/[type]` | Movie list by type (`phim-moi`, `phim-bo`, `phim-le`, `hoat-hinh`, `tv-shows`) |
| `/movie/[slug]` | Movie detail — poster, info, cast, episode list |
| `/watch/[slug]` | Video player — HLS stream, server/episode switcher |
| `/search?q=...` | Search results with pagination |
| `/the-loai/[slug]` | Filter by genre |
| `/history` | Watch history with progress bars |
| `/favorites` | Saved favorites |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home
│   ├── layout.tsx                # Root layout + Navbar
│   ├── danh-sach/[type]/         # Movie list by type
│   ├── movie/[slug]/             # Movie detail
│   ├── watch/[slug]/             # Player
│   ├── search/                   # Search results
│   ├── the-loai/[slug]/          # By genre
│   ├── history/                  # Watch history
│   └── favorites/                # Favorites
├── components/
│   ├── Navbar.tsx                # Top nav with search
│   ├── MovieCard.tsx             # Poster card with badges
│   ├── MovieGrid.tsx             # Responsive grid
│   ├── Pagination.tsx            # Page navigation
│   ├── VideoPlayer.tsx           # HLS player + embed fallback
│   └── FavoriteButton.tsx        # Toggle heart button
└── lib/
    ├── api.ts                    # All API calls (ophim1.com)
    ├── types.ts                  # TypeScript interfaces
    └── storage.ts                # localStorage utilities
```

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

---

## Docker

### Build image

```bash
docker build -t haibapfilm-web:latest .
```

### Run standalone (no proxy)

```bash
docker run -d \
  --name haibapfilm-web \
  -p 3000:3000 \
  --restart unless-stopped \
  haibapfilm-web:latest
```

Open [http://your-server-ip:3000](http://localhost:3000).

---

## Docker Compose + Nginx Proxy Manager (production)

This is the recommended production setup. The container joins the existing `proxy` network used by Nginx Proxy Manager so NPM can route traffic by container name — **no port exposure needed**.

### Step 1 — Ensure Nginx Proxy Manager is running

```yaml
# /home/silp/docker-compose.yml
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    networks:
      - proxy

networks:
  proxy:
    name: proxy
```

```bash
docker compose up -d   # from /home/silp/
```

### Step 2 — Start the web app

```bash
cd /home/silp/movie-webapp
docker compose up -d
```

### Step 3 — Add Proxy Host in NPM UI (`http://your-server:81`)

| Field | Value |
|-------|-------|
| Domain Names | `film.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname | `haibapfilm-web` |
| Forward Port | `3000` |
| Block Common Exploits | ✅ enabled |

### Step 4 — Enable SSL

In the **SSL** tab of the proxy host:
- Select **Request a new SSL certificate**
- Provider: **Let's Encrypt**
- Enable **Force SSL**
- Enable **HTTP/2 Support**
- Click **Save**

✅ The app is now live at `https://film.yourdomain.com`.

---

## Rebuild after code changes

```bash
cd /home/silp/movie-webapp
docker compose up -d --build
```

---

## Environment Variables

No environment variables are required. The API base URL and image CDN are configured in `src/lib/api.ts`.

Optional overrides via `.env.local`:

```env
# .env.local (optional, not committed)
NEXT_PUBLIC_API_BASE=https://ophim1.com/v1/api
NEXT_PUBLIC_CDN_URL=https://img.ophim.live/uploads/movies/
```

---

## API Reference

Data is fetched server-side from [ophim1.com](https://ophim1.com):

| Endpoint | Description |
|----------|-------------|
| `GET /v1/api/home` | Featured movies for home page |
| `GET /v1/api/danh-sach/{type}?page=1` | Paginated list by type |
| `GET /v1/api/tim-kiem?keyword=&page=1` | Search by title |
| `GET /v1/api/phim/{slug}` | Full movie detail + episode servers |
| `GET /v1/api/the-loai/{slug}?page=1` | Filter by genre |

Image CDN: `https://img.ophim.live/uploads/movies/`

---

## License

MIT
