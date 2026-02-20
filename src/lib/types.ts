export interface Category {
  id: string
  name: string
  slug: string
}

export interface Country {
  id: string
  name: string
  slug: string
}

export interface Movie {
  id: string
  name: string
  slug: string
  originName: string
  type: string
  thumbUrl: string
  posterUrl: string
  year: number
  quality: string
  lang: string
  episodeCurrent: string
  time: string
  categories: Category[]
  countries: Country[]
  tmdbRating: number
  imdbRating: number
}

export interface EpisodeItem {
  name: string
  slug: string
  linkEmbed: string
  linkM3u8: string
}

export interface EpisodeServer {
  serverName: string
  items: EpisodeItem[]
}

export interface MovieDetail extends Movie {
  content: string
  trailerUrl: string
  actors: string[]
  directors: string[]
  episodes: EpisodeServer[]
  status: string
  view: number
  episodeTotal: string
}

export interface PaginatedMovies {
  movies: Movie[]
  currentPage: number
  totalItems: number
  totalItemsPerPage: number
}

export interface WatchHistoryItem {
  movieSlug: string
  movieName: string
  episodeSlug: string
  episodeName: string
  thumbUrl: string
  positionMs: number
  durationMs: number
  watchedAt: number
}

export interface Favorite {
  movieSlug: string
  name: string
  thumbUrl: string
  year: number
  episodeCurrent: string
  addedAt: number
}
