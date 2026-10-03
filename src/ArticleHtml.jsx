import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import echartsAsset from 'echarts/dist/echarts.min.js?url'
import { runReport } from './html-report-runtime'
import './article-html.css'
import VideoEmbed from './VideoEmbed'
import { parseVideoSource } from './video-source'

const frameStyles = `
html,body { min-height:0!important; height:auto!important; max-width:100%!important; }
body { overflow-wrap:anywhere; }
img { max-width:100%; height:auto; }
.dami-table-scroll { max-width:100%; overflow-x:auto; }
.dami-table-scroll:focus-visible { outline:2px solid #7853d8; outline-offset:2px; }
.dami-chart { width:100%!important; max-width:100%!important; min-width:0!important; overflow:hidden; }
.dami-chart-description { font-size:13px; color:#62606b; line-height:1.6; }
@media(max-width:640px) {
  .metric-row,.kpi-grid,.two-col { grid-template-columns:1fr!important; }
  .chart-module { min-width:0!important; }
}
@media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; } }
`
const emptyCharts = []

function serialize(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}

function createDocument(source, contentUrl, token, charts) {
  const clean = DOMPurify.sanitize(source, {
    WHOLE_DOCUMENT: true,
    ADD_TAGS: ['style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'base', 'link', 'meta'],
    FORBID_ATTR: ['srcdoc'],
  })
  const doc = new DOMParser().parseFromString(clean, 'text/html')
  const nonce = crypto.randomUUID().replaceAll('-', '')
  const baseUrl = new URL(contentUrl, window.location.href)
  const videos = []
  for (const el of doc.querySelectorAll('div[data-video-url]')) {
    const spec = { url: el.dataset.videoUrl, title: el.dataset.videoTitle || '引用视频', start: el.dataset.videoStart }
    const slot = doc.createElement('div')
    if (!parseVideoSource(spec.url, spec.start)) {
      slot.textContent = '视频地址无效或平台暂不支持。'
    } else {
      slot.className = 'dami-video-slot'
      slot.dataset.videoIndex = String(videos.length)
      slot.textContent = '视频引用：请使用下方播放器或原站链接观看。'
      slot.style.cssText = 'position:relative;min-height:372px;margin:24px 0;'
      videos.push(spec)
    }
    el.replaceWith(slot)
  }
  // Rebase local images/CSS assets to the source file rather than the article route.
  for (const el of doc.querySelectorAll('[src],a[href]')) {
    const attr = el.hasAttribute('src') ? 'src' : 'href'
    const value = el.getAttribute(attr)
    if (!value || value.startsWith('#')) continue
    try { el.setAttribute(attr, new URL(value, baseUrl).href) } catch { el.removeAttribute(attr) }
    if (el.tagName === 'A') { el.target = '_blank'; el.rel = 'noopener noreferrer' }
  }
  doc.querySelectorAll('[srcset]').forEach((el) => el.removeAttribute('srcset'))
  for (const style of doc.querySelectorAll('style')) {
    style.textContent = style.textContent.replace(/@import\s+[^;]+;/gi, '').replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi, (match, quote, value) => {
      if (value.startsWith('#') || value.startsWith('data:')) return match
      try { return `url("${new URL(value, baseUrl).href}")` } catch { return 'none' }
    })
  }
  for (const table of doc.querySelectorAll('table')) {
    const wrapper = doc.createElement('div')
    wrapper.className = 'dami-table-scroll'
    wrapper.tabIndex = 0
    wrapper.setAttribute('role', 'region')
    wrapper.setAttribute('aria-label', '表格，可横向滚动')
    table.replaceWith(wrapper)
    wrapper.append(table)
  }
  // Exported editor chrome is not part of the report.
  doc.querySelectorAll('[data-trae-edit-ui],#trae-previewer-tools-styles').forEach((el) => el.remove())
  const css = doc.createElement('style')
  css.textContent = frameStyles
  doc.head.append(css)
  const csp = doc.createElement('meta')
  csp.httpEquiv = 'Content-Security-Policy'
  csp.content = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src https: http: data:; font-src https: data:; connect-src 'none'; base-uri 'none'; form-action 'none'`
  doc.head.prepend(csp)
  const script = doc.createElement('script')
  script.setAttribute('nonce', nonce)
  script.textContent = `(${runReport.toString()})(${serialize({ token, charts, nonce, echartsUrl: new URL(echartsAsset, window.location.href).href })});`
  doc.body.append(script)
  return { html: '<!doctype html>\n' + doc.documentElement.outerHTML, videos }
}

export default function ArticleHtml({ children, contentUrl, title, charts = emptyCharts, warning = '' }) {
  const frame = useRef(null)
  const [height, setHeight] = useState(600)
  const [chartError, setChartError] = useState('')
  const [videoRects, setVideoRects] = useState([])
  const token = useMemo(() => crypto.randomUUID(), [children, contentUrl, charts])
  const source = useMemo(() => createDocument(children, contentUrl, token, charts), [children, contentUrl, token, charts])

  useEffect(() => {
    setHeight(600)
    setChartError('')
    setVideoRects([])
    const receive = (event) => {
      const data = event.data
      if (event.source !== frame.current?.contentWindow || data?.channel !== 'dami-report' || data.token !== token) return
      if (data.type === 'height' && Number.isFinite(data.height)) {
        setHeight(Math.min(200000, Math.max(200, data.height)))
        if (Array.isArray(data.videos)) setVideoRects(data.videos.filter((rect) => Number.isInteger(rect.index) && rect.index >= 0 && rect.index < source.videos.length && ['top', 'left', 'width', 'height'].every((key) => Number.isFinite(rect[key]) && rect[key] >= 0 && rect[key] < 200000)))
      } else if (data.type === 'anchor' && Number.isFinite(data.top)) {
        const top = frame.current.getBoundingClientRect().top + window.scrollY + data.top - 100
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
      } else if (data.type === 'chart-error') setChartError('部分图表暂时无法显示，正文和数据说明仍可阅读。')
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [token, source])

  return <div className="html-report">
    {chartError || warning ? <p className="reader-status" role="status">{chartError || warning}</p> : null}
    <div style={{ position: 'relative' }}>
      <iframe ref={frame} title={`${title}：专题正文`} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={source.html} style={{ height }} />
      {videoRects.map((rect) => <div className="html-video-overlay" key={rect.index} style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}><VideoEmbed {...source.videos[rect.index]} /></div>)}
    </div>
  </div>
}
