// Accept public watch URLs only; never accept an authored iframe or embed hostname.
export function parseVideoSource(value, start) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    let provider, id
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) {
      provider = 'youtube'
      id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:shorts|live)\/([^/]+)\/?$/)?.[1]
      if (!/^[\w-]{11}$/.test(id ?? '')) return null
    } else if (['bilibili.com', 'www.bilibili.com', 'm.bilibili.com'].includes(url.hostname)) {
      provider = 'bilibili'
      id = url.pathname.match(/^\/video\/(BV[A-Za-z0-9]{10})\/?$/)?.[1]
      if (!id) return null
    } else return null
    const rawTime = String(start ?? url.searchParams.get('t') ?? url.searchParams.get('start') ?? '0')
    const time = rawTime.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
    const seconds = /^\d+$/.test(rawTime) ? Number(rawTime) : time && time[0] ? Number(time[1] || 0) * 3600 + Number(time[2] || 0) * 60 + Number(time[3] || 0) : 0
    const safeTime = Math.min(86400, Math.max(0, seconds))
    const page = Math.max(1, Math.min(1000, Number(url.searchParams.get('p')) || 1)) | 0
    const watch = provider === 'youtube' ? `https://www.youtube.com/watch?v=${id}&t=${safeTime}s` : `https://www.bilibili.com/video/${id}/?p=${page}&t=${safeTime}`
    const embed = provider === 'youtube' ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&playsinline=1&start=${safeTime}` : `https://player.bilibili.com/player.html?bvid=${id}&p=${page}&t=${safeTime}&autoplay=0`
    return { provider, watch, embed, platform: provider === 'youtube' ? 'YouTube' : 'B站' }
  } catch { return null }
}
