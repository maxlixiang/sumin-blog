import { lazy, StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const Markdown = lazy(() => import('react-markdown'))

const photos = [
  { alt: '窗边的黄色花束', className: 'photo-one' },
  { alt: '日常阅读一角', className: 'photo-two' },
  { alt: '傍晚的城市天空', className: 'photo-three' },
]

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={down ? 'M12 4v15m0 0 6-6m-6 6-6-6' : 'M5 12h14m-6-6 6 6-6 6'} /></svg>
}

function Header() {
  return <header className="site-header">
    <a href="#top" className="brand" aria-label="苏敏的小站，返回首页"><span className="brand-mark">苏</span><span>苏敏的小站</span></a>
    <nav aria-label="主导航"><a href="#top">首页</a><a href="#writing">文章</a><a href="#life">动态</a><a href="#about">关于</a></nav>
    <a href="mailto:hello@example.com" className="contact-link">联系我</a>
  </header>
}

function Hero() {
  return <section className="hero" id="top">
    <div className="hero-copy">
      <h1>我是苏敏<br /><span className="focus-line">专注 <em>职场</em> <b className="hero-separator">+</b> <em>个人成长</em> <b className="hero-separator">+</b> <em>AI</em></span></h1>
      <p className="hero-description">记录观察、思考与正在发生的生活。<br />愿每一次微小的积累，都有回响。</p>
      <div className="hero-actions">
        <a className="button button-dark" href="#writing">阅读文章 <Arrow /></a>
        <a className="button button-light" href="#about">查看简历 <Arrow down /></a>
      </div>
    </div>
    <div className="hero-art" aria-label="戴着黄头巾、手捧 lifelong learning 书本的插画">
      <span className="sparkle sparkle-top">✦</span><span className="sparkle sparkle-side">✦</span>
      <img src="/assets/sumin-reading-cutout-clean.png" alt="苏敏阅读 lifelong learning 书本的插画" />
    </div>
  </section>
}

function Articles({ articles, onOpen }) {
  return <section className="writing section" id="writing">
    <div className="section-heading"><div><p className="section-kicker">WRITING</p><h2>最新文章</h2></div><a href="#writing" className="text-link">查看全部 <Arrow /></a></div>
    <div className="article-list">
      {articles.map((article, index) => <button className="article" type="button" onClick={() => onOpen(article)} key={article.id}><span className="article-no">0{index + 1}</span><div className="article-meta"><time>{article.date}</time><span>{article.category}</span></div><div className="article-body"><h3>{article.title}</h3><p>{article.excerpt}</p></div><span className="round-arrow" aria-hidden="true"><Arrow /></span></button>)}
    </div>
  </section>
}

function ArticleReader({ article, onClose }) {
  const [markdown, setMarkdown] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!article) return undefined
    let cancelled = false
    setMarkdown('')
    setStatus('loading')
    fetch(article.content)
      .then((response) => {
        if (!response.ok) throw new Error('Article could not be loaded')
        return response.text()
      })
      .then((text) => {
        if (!cancelled) {
          setMarkdown(text.replace(/^\s*#\s+[^\n]+\n+/, ''))
          setStatus('ready')
        }
      })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [article])

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  if (!article) return null
  return <div className="reader-overlay" role="dialog" aria-modal="true" aria-labelledby="article-title">
    <article className="reader-panel">
      <header className="reader-header"><div><p className="section-kicker">{article.category} · {article.date}</p><h2 id="article-title">{article.title}</h2></div><button className="reader-close" type="button" onClick={onClose} aria-label="关闭文章">×</button></header>
      <div className="reader-actions"><button type="button" onClick={onClose}>返回文章列表 <Arrow /></button></div>
      {status === 'loading' && <p className="reader-status">正在载入全文…</p>}
      {status === 'error' && <p className="reader-status">正文载入失败，请稍后再试。</p>}
      {status === 'ready' ? <div className="reader-content"><Suspense fallback={<p className="reader-status">正在排版正文…</p>}><Markdown>{markdown}</Markdown></Suspense></div> : null}
    </article>
  </div>
}

function Life() {
  return <section className="life section" id="life"><div className="life-top"><div><p className="section-kicker">LIFE LOG</p><h2>生活片段</h2></div><p>一些值得留存的光、路途与寻常日子。</p></div><div className="photo-strip">{photos.map((photo) => <div className={`photo ${photo.className}`} role="img" aria-label={photo.alt} key={photo.className} />)}</div></section>
}

function About() {
  return <section className="about section" id="about"><div><p className="section-kicker">ABOUT ME</p><h2>慢慢走，也认真记录。</h2></div><div className="about-copy"><p>我是苏敏，一名持续学习、持续书写的人。这里收纳我的行业观察、生活手记，以及关于工作的长期思考。</p><a href="mailto:hello@example.com" className="text-link">认识一下 <Arrow /></a></div></section>
}

function App() {
  const [articles, setArticles] = useState([])
  const [activeArticle, setActiveArticle] = useState(null)
  useEffect(() => {
    fetch('/articles/index.json')
      .then((response) => response.ok ? response.json() : [])
      .then(setArticles)
      .catch(() => setArticles([]))
  }, [])
  return <><Header /><main><Hero /><Articles articles={articles} onOpen={setActiveArticle} /><Life /><About /></main><footer>© {new Date().getFullYear()} 苏敏的小站 <span>Keep learning, keep growing.</span></footer>{activeArticle ? <ArticleReader article={activeArticle} onClose={() => setActiveArticle(null)} /> : null}</>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
