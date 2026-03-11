export interface IcsParams {
  partyId: string
  code: string
  movieTitle: string
  movieSlug: string
  episodeSlug: string
  scheduledFor: Date   // UTC
  durationMinutes: number
  appUrl: string
}

// Format date as YYYYMMDDTHHmmss in Asia/Ho_Chi_Minh
function formatLocalVN(date: Date): string {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(f.formatToParts(date).map(p => [p.type, p.value]))
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

// Format date as UTC stamp for DTSTAMP
function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace('.000', '')
}

// ICS fold: lines > 75 chars need CRLF + space continuation
function fold(line: string): string {
  const max = 75
  if (line.length <= max) return line
  let out = line.slice(0, max)
  let rest = line.slice(max)
  while (rest.length > 0) {
    out += '\r\n ' + rest.slice(0, max - 1)
    rest = rest.slice(max - 1)
  }
  return out
}

export function buildIcs(p: IcsParams): string {
  const watchUrl = `${p.appUrl}/watch/${p.movieSlug}?episode=${p.episodeSlug}&party=${p.code}`
  const dtStart = formatLocalVN(p.scheduledFor)
  const dtEnd   = formatLocalVN(new Date(p.scheduledFor.getTime() + p.durationMinutes * 60000))
  const dtStamp = formatUtc(new Date())

  const description = `Bạn được mời xem phim cùng nhau!\\n\\nLink tham gia: ${watchUrl}\\n\\nMã phòng: ${p.code}`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HaiBapFilm//Watch Party//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${p.partyId}@film.lamphusi.tech`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}`,
    `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}`,
    fold(`SUMMARY:Watch Party: ${p.movieTitle}`),
    fold(`DESCRIPTION:${description}`),
    fold(`URL:${watchUrl}`),
    'ORGANIZER;CN=HaiBapFilm:mailto:noreply@film.lamphusi.tech',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}
