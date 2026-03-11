export interface ScheduleEmailParams {
  movieTitle: string
  moviePosterUrl: string
  movieDescription: string
  episodeName: string
  scheduledFor: Date        // UTC
  durationMinutes: number
  code: string
  watchUrl: string
  hostName: string
}

function formatDatetimeVN(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} giờ`
  return `${h} giờ ${m} phút`
}

function truncate(text: string, max = 160): string {
  if (!text) return ''
  const plain = text.replace(/<[^>]+>/g, '')
  return plain.length > max ? plain.slice(0, max) + '…' : plain
}

export function buildScheduleEmailHtml(p: ScheduleEmailParams): string {
  const datetimeStr   = formatDatetimeVN(p.scheduledFor)
  const durationStr   = formatDuration(p.durationMinutes)
  const descSnippet   = truncate(p.movieDescription, 180)
  const hasPoster     = !!p.moviePosterUrl

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Watch Party: ${p.movieTitle}</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:32px 16px;">
<tr><td align="center">

<!-- Card -->
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1A1A1A;border-radius:16px;overflow:hidden;border:1px solid #2A2A2A;">

  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,#1E1033 0%,#2D1566 100%);padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="color:#BB86FC;font-size:22px;font-weight:700;letter-spacing:-0.5px;">🎬 HaiBapFilm</span>
          </td>
          <td align="right">
            <span style="background:#BB86FC;color:#000;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;">WATCH PARTY</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Invite headline -->
  <tr>
    <td style="padding:28px 32px 0;">
      <p style="margin:0;color:#9CA3AF;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Lời mời xem phim</p>
      <h1 style="margin:8px 0 0;color:#FFFFFF;font-size:26px;font-weight:700;line-height:1.25;">${p.movieTitle}</h1>
      ${p.episodeName ? `<p style="margin:6px 0 0;color:#BB86FC;font-size:14px;font-weight:500;">${p.episodeName}</p>` : ''}
    </td>
  </tr>

  ${hasPoster ? `
  <!-- Poster + description row -->
  <tr>
    <td style="padding:20px 32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="110" valign="top" style="padding-right:16px;">
            <img src="${p.moviePosterUrl}" width="110" alt="${p.movieTitle}"
              style="border-radius:8px;display:block;width:110px;object-fit:cover;">
          </td>
          <td valign="top">
            <p style="margin:0;color:#9CA3AF;font-size:13px;line-height:1.6;">${descSnippet}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>` : descSnippet ? `
  <tr>
    <td style="padding:20px 32px 0;">
      <p style="margin:0;color:#9CA3AF;font-size:13px;line-height:1.6;">${descSnippet}</p>
    </td>
  </tr>` : ''}

  <!-- Divider -->
  <tr><td style="padding:24px 32px 0;"><div style="height:1px;background:#2A2A2A;"></div></td></tr>

  <!-- Party details card -->
  <tr>
    <td style="padding:20px 32px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#252525;border-radius:12px;border:1px solid #333;">

        <!-- Host -->
        <tr>
          <td style="padding:16px 20px 12px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#BB86FC;font-size:18px;width:28px;">👤</td>
                <td>
                  <span style="color:#6B7280;font-size:12px;display:block;">Được mời bởi</span>
                  <span style="color:#F3F4F6;font-size:14px;font-weight:600;">${p.hostName}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:0 20px;"><div style="height:1px;background:#333;"></div></td></tr>

        <!-- Date/time -->
        <tr>
          <td style="padding:16px 20px 12px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#BB86FC;font-size:18px;width:28px;">📅</td>
                <td>
                  <span style="color:#6B7280;font-size:12px;display:block;">Thời gian</span>
                  <span style="color:#FFFFFF;font-size:15px;font-weight:700;">${datetimeStr}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:0 20px;"><div style="height:1px;background:#333;"></div></td></tr>

        <!-- Duration -->
        <tr>
          <td style="padding:16px 20px 12px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#BB86FC;font-size:18px;width:28px;">⏱️</td>
                <td>
                  <span style="color:#6B7280;font-size:12px;display:block;">Thời lượng dự kiến</span>
                  <span style="color:#F3F4F6;font-size:14px;font-weight:600;">${durationStr}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:0 20px;"><div style="height:1px;background:#333;"></div></td></tr>

        <!-- Party code -->
        <tr>
          <td style="padding:16px 20px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#BB86FC;font-size:18px;width:28px;">🔑</td>
                <td>
                  <span style="color:#6B7280;font-size:12px;display:block;">Mã phòng</span>
                  <span style="color:#BB86FC;font-size:22px;font-weight:700;font-family:'Courier New',monospace;letter-spacing:6px;">${p.code}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- CTA Button -->
  <tr>
    <td style="padding:28px 32px 8px;" align="center">
      <a href="${p.watchUrl}"
        style="display:inline-block;background:#BB86FC;color:#000000;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:50px;letter-spacing:0.3px;">
        🎬 Tham gia Watch Party ngay
      </a>
    </td>
  </tr>

  <!-- ICS note -->
  <tr>
    <td style="padding:16px 32px 0;" align="center">
      <p style="margin:0;color:#6B7280;font-size:12px;">
        📎 File <strong style="color:#9CA3AF;">.ics</strong> đính kèm — thêm vào Google Calendar, Outlook hoặc Apple Calendar
      </p>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:24px 32px 28px;" align="center">
      <div style="height:1px;background:#2A2A2A;margin-bottom:20px;"></div>
      <p style="margin:0;color:#4B5563;font-size:12px;line-height:1.6;">
        Email này được gửi từ <a href="https://film.lamphusi.tech" style="color:#6B7280;text-decoration:none;">film.lamphusi.tech</a><br>
        Nếu bạn không muốn nhận lời mời này, hãy liên hệ người gửi.
      </p>
    </td>
  </tr>

</table>
<!-- End card -->

</td></tr>
</table>
<!-- End wrapper -->

</body>
</html>`
}
