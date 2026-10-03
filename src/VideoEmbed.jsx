import { useState } from 'react'
import { parseVideoSource } from './video-source'
import './video-embed.css'

export default function VideoEmbed({ url, title = '引用视频', start }) {
  const source = parseVideoSource(url, start)
  const [loaded, setLoaded] = useState(false)
  if (!source) return <aside className="video-invalid">视频地址无效或平台暂不支持，请使用 YouTube 或哔哩哔哩的视频页面链接。</aside>
  return <section className="video-card" aria-label={title}>
    <header><span>{source.platform} · 视频引用</span><strong>{title}</strong></header>
    <div className="video-stage">
      {loaded ? <iframe src={source.embed} title={title} referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen />
        : <button type="button" onClick={() => setLoaded(true)} aria-label={`加载视频：${title}`}><span aria-hidden="true">▷</span><strong>点击加载视频</strong><small>连接 {source.platform}，加载后手动播放</small></button>}
    </div>
    <footer><a href={source.watch} target="_blank" rel="noopener noreferrer">在 {source.platform}观看 ↗</a><p>无法播放或需要登录、会员画质时，请到原站观看。</p></footer>
  </section>
}
