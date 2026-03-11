import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

// ── Auth guard ──────────────────────────────────────────────────────────────
async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/')
  return user
}

// ── Data fetching ───────────────────────────────────────────────────────────
async function fetchAnalytics() {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const now = new Date()
  const day1  = new Date(now.getTime() -  1 * 86400000).toISOString()
  const day7  = new Date(now.getTime() -  7 * 86400000).toISOString()
  const day14 = new Date(now.getTime() - 14 * 86400000).toISOString()
  const day30 = new Date(now.getTime() - 30 * 86400000).toISOString()

  const [
    { count: views24h },
    { count: views7d },
    { count: views30d },
    { data: topPages },
    { data: dailyWeb },
    { data: countryStats },
    { data: cityStats },
    { data: topIPs },
    { count: totalDevices },
    { data: devicesByMfr },
    { data: recentPings },
    { count: partyCount },
  ] = await Promise.all([
    admin.from('web_visits').select('*', { count: 'exact', head: true }).gte('created_at', day1),
    admin.from('web_visits').select('*', { count: 'exact', head: true }).gte('created_at', day7),
    admin.from('web_visits').select('*', { count: 'exact', head: true }).gte('created_at', day30),

    admin.rpc('web_top_pages', { since: day7 }).limit(10),
    admin.rpc('web_daily_stats', { since: day14 }),
    admin.rpc('web_country_stats', { since: day30 }).limit(15),
    admin.rpc('web_city_stats', { since: day30 }).limit(10),
    admin.rpc('web_top_ips', { since: day7 }).limit(20),

    admin.from('app_installs').select('*', { count: 'exact', head: true }),
    admin.rpc('devices_by_manufacturer'),
    admin.from('app_installs')
      .select('device_id, device_model, manufacturer, app_version, last_seen_at')
      .gte('last_seen_at', day7)
      .order('last_seen_at', { ascending: false })
      .limit(20),

    admin.from('watch_party_sessions').select('*', { count: 'exact', head: true }),
  ])

  return {
    views24h:     views24h ?? 0,
    views7d:      views7d ?? 0,
    views30d:     views30d ?? 0,
    topPages:     (topPages     as { path: string; views: number }[]                             | null) ?? [],
    dailyWeb:     (dailyWeb     as { day: string; views: number; unique_ips: number }[]          | null) ?? [],
    countryStats: (countryStats as { country: string; views: number; unique_ips: number }[]      | null) ?? [],
    cityStats:    (cityStats    as { city: string; country: string; views: number }[]            | null) ?? [],
    topIPs:       (topIPs       as { ip: string; views: number; country: string; city: string }[]| null) ?? [],
    totalDevices: totalDevices ?? 0,
    devicesByMfr: (devicesByMfr as { manufacturer: string; count: number }[]                    | null) ?? [],
    recentPings:  (recentPings  as {
      device_id: string; device_model: string; manufacturer: string;
      app_version: string; last_seen_at: string
    }[] | null) ?? [],
    partyCount: partyCount ?? 0,
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{Number(value).toLocaleString()}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-300 mb-3 border-b border-gray-800 pb-2">{title}</h2>
      {children}
    </section>
  )
}

function BarRow({ label, value, max, sub }: { label: string; value: number; max: number; sub?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-36 shrink-0 text-sm text-gray-300 truncate" title={label}>{label || '—'}</div>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-16 text-right font-mono text-sm text-white shrink-0">{value.toLocaleString()}</div>
      {sub && <div className="w-20 text-right text-xs text-gray-500 shrink-0">{sub}</div>}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p trước`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h trước`
  return `${Math.floor(diff / 86400000)}d trước`
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AnalyticsPage() {
  await requireAdmin()
  const data = await fetchAnalytics()

  const maxCountry = Math.max(...data.countryStats.map((r) => r.views), 1)
  const maxCity    = Math.max(...data.cityStats.map((r) => r.views), 1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">HaiBapFilm — Admin Dashboard</p>
        </div>
        <a href="/" className="text-sm text-gray-400 hover:text-white transition">← Về trang chủ</a>
      </div>

      {/* Summary cards */}
      <Section title="Tổng quan">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Web views hôm nay"  value={data.views24h} />
          <StatCard label="Web views 7 ngày"   value={data.views7d} />
          <StatCard label="Web views 30 ngày"  value={data.views30d} />
          <StatCard label="Android devices"    value={data.totalDevices} sub="Tất cả thời gian" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <StatCard label="Watch Parties tạo"  value={data.partyCount} sub="Tất cả thời gian" />
          <StatCard label="Android active 7d"  value={data.recentPings.length} sub="Thiết bị ping gần đây" />
          <StatCard label="Quốc gia (30 ngày)" value={data.countryStats.length} sub="Số quốc gia khác nhau" />
          <StatCard label="IP duy nhất (7 ngày)" value={data.topIPs.length} sub="Top 20 IPs" />
        </div>
      </Section>

      {/* Daily web stats */}
      {data.dailyWeb.length > 0 && (
        <Section title="Web — Lượt xem theo ngày (14 ngày qua)">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3 text-right">Lượt xem</th>
                  <th className="px-4 py-3 text-right">IP duy nhất</th>
                  <th className="px-4 py-3 pr-4" />
                </tr>
              </thead>
              <tbody>
                {data.dailyWeb.map((row, i) => {
                  const max = Math.max(...data.dailyWeb.map((r) => r.views), 1)
                  const pct = Math.round((row.views / max) * 100)
                  return (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-gray-300">{formatDate(row.day)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-white">{row.views.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-400">{row.unique_ips?.toLocaleString() ?? '—'}</td>
                      <td className="px-4 py-2.5 pr-4 w-32">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Country + City side by side */}
      {(data.countryStats.length > 0 || data.cityStats.length > 0) && (
        <Section title="Web — Phân bổ địa lý (30 ngày qua)">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Country breakdown */}
            {data.countryStats.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Theo quốc gia</h3>
                {data.countryStats.map((row, i) => (
                  <BarRow
                    key={i}
                    label={row.country || 'Unknown'}
                    value={row.views}
                    max={maxCountry}
                    sub={`${row.unique_ips} IP`}
                  />
                ))}
              </div>
            )}

            {/* City breakdown */}
            {data.cityStats.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Theo thành phố</h3>
                {data.cityStats.map((row, i) => (
                  <BarRow
                    key={i}
                    label={row.city || 'Unknown'}
                    value={row.views}
                    max={maxCity}
                    sub={row.country}
                  />
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Top IPs */}
      {data.topIPs.length > 0 && (
        <Section title="Web — Top IP (7 ngày qua)">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Quốc gia</th>
                  <th className="px-4 py-3">Thành phố</th>
                  <th className="px-4 py-3 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody>
                {data.topIPs.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-300">{row.ip || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400">{row.country || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{row.city || '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-white">{row.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Top pages */}
      {data.topPages.length > 0 && (
        <Section title="Web — Top trang xem nhiều (7 ngày qua)">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Đường dẫn</th>
                  <th className="px-4 py-3 text-right">Lượt xem</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2.5 text-gray-300 font-mono text-xs">{row.path}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-white">{row.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Android devices by manufacturer */}
      {data.devicesByMfr.length > 0 && (
        <Section title="Android — Thiết bị theo hãng">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.devicesByMfr.slice(0, 8).map((item, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-400 capitalize">{item.manufacturer || 'Unknown'}</p>
                <p className="text-xl font-bold text-white mt-0.5">{item.count}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recent Android pings */}
      {data.recentPings.length > 0 && (
        <Section title="Android — Thiết bị hoạt động gần đây (7 ngày)">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="px-4 py-3">Thiết bị</th>
                  <th className="px-4 py-3">Hãng</th>
                  <th className="px-4 py-3">Phiên bản</th>
                  <th className="px-4 py-3 text-right">Lần cuối</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPings.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-300">{row.device_model || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400 capitalize">{row.manufacturer || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{row.app_version || '—'}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500 text-xs">
                      {row.last_seen_at ? timeAgo(row.last_seen_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <p className="text-center text-xs text-gray-600 pb-4">
        Dữ liệu cập nhật theo thời gian thực • {new Date().toLocaleString('vi-VN')}
      </p>
    </div>
  )
}
