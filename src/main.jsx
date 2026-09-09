import { lazy, StrictMode, Suspense, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './footer.css'

const Markdown = lazy(() => import('react-markdown'))

const journeyItems = [
  { date: '2014.09 — 2018.07', title: '法学与计算机双学位', description: '在西北大学完成法学与计算机科学双学位，建立规则理解与技术思维的双重基础。', tags: ['法学基础', '计算机科学', '跨学科思维', '模拟法庭'] },
  { date: '2019.08 — 2021.05', title: '南加州大学法学硕士', description: '赴美攻读 LLM，围绕商法、公司法与知识产权继续拓展涉外法律视野。', tags: ['LLM', '商法', '公司法', '知识产权'] },
  { date: '2021.06 — 2023.12', title: '中美法律实践', description: '从北京的资本市场项目走到洛杉矶律所，参与法律研究、诉讼支持与常年法律服务。', tags: ['资本市场', '法律研究', '诉讼支持', '英文写作'] },
  { date: '2024.05 — 2026.06', title: '上海律师执业', description: '处理公司与争议业务，在定增、海商争议、破产清算和数据合规等项目中积累实务经验。', tags: ['公司业务', '争议解决', '破产清算', '数据合规'] },
  { date: '现在进行时', title: 'Vibe Coding', description: '把反复使用的方法整理成标准流程，再做成可以实际使用的 Skill 和网页。', tags: ['需求定义', '流程梳理', '产品落地'] },
]

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={down ? 'M12 4v15m0 0 6-6m-6 6-6-6' : 'M5 12h14m-6-6 6 6-6 6'} /></svg>
}

const navSections = [
  { id: 'top', navKey: 'about' },
  { id: 'writing', navKey: 'writing' },
  { id: 'journey', navKey: 'journey' },
  { id: 'life', navKey: 'life' },
  { id: 'about', navKey: 'about' },
]

function useScrollSpy() {
  const [activeSection, setActiveSection] = useState(() => {
    const hashId = window.location.hash.slice(1)
    return navSections.find(({ id }) => id === hashId)?.navKey ?? 'about'
  })

  useEffect(() => {
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80
    const sections = navSections
      .map(({ id, navKey }) => ({ element: document.getElementById(id), navKey }))
      .filter(({ element }) => element)
    const visibleSections = new Map()

    const syncHash = () => {
      const hashId = window.location.hash.slice(1)
      const section = navSections.find(({ id }) => id === hashId)
      if (!section) return
      setActiveSection(section.navKey)
      window.requestAnimationFrame(() => document.getElementById(hashId)?.scrollIntoView())
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = sections.find(({ element }) => element === entry.target)
        if (section) visibleSections.set(entry.target, { entry, navKey: section.navKey })
      })
      const atPageEnd = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2
      if (atPageEnd) {
        setActiveSection('about')
        return
      }
      const candidate = [...visibleSections.values()]
        .filter(({ entry }) => entry.isIntersecting)
        .sort(({ entry: a }, { entry: b }) => Math.abs(a.boundingClientRect.top - headerHeight) - Math.abs(b.boundingClientRect.top - headerHeight))[0]
      if (candidate) setActiveSection(candidate.navKey)
    }, {
      rootMargin: `-${Math.round(headerHeight)}px 0px -55% 0px`,
      threshold: [0, 0.05, 0.2, 0.5],
    })

    sections.forEach(({ element }) => observer.observe(element))
    window.addEventListener('hashchange', syncHash)
    syncHash()
    return () => {
      observer.disconnect()
      window.removeEventListener('hashchange', syncHash)
    }
  }, [])

  return [activeSection, setActiveSection]
}

function useSectionReveal() {
  useEffect(() => {
    const elements = [...document.querySelectorAll('[data-reveal]')]
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-revealed'))
      return undefined
    }

    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 80
    const initiallyVisible = elements.filter((element) => {
      const rect = element.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > headerHeight
    })
    initiallyVisible.forEach((element) => element.classList.add('is-revealed'))
    document.documentElement.classList.add('reveal-ready')

    let pending = elements.filter((element) => !element.classList.contains('is-revealed'))
    let frameId = 0
    const revealVisibleSections = () => {
      frameId = 0
      const visible = pending.filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.top < window.innerHeight * 0.9 && rect.bottom > headerHeight
      })
      visible.forEach((element) => element.classList.add('is-revealed'))
      const visibleSet = new Set(visible)
      pending = pending.filter((element) => !visibleSet.has(element))
      if (pending.length === 0) window.removeEventListener('scroll', queueReveal)
    }
    const queueReveal = () => {
      if (!frameId) frameId = window.requestAnimationFrame(revealVisibleSections)
    }

    window.addEventListener('scroll', queueReveal, { passive: true })
    queueReveal()
    return () => {
      window.removeEventListener('scroll', queueReveal)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])
}

function Header({ activeSection, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const navigate = (section) => {
    onNavigate(section)
    setMenuOpen(false)
  }

  return <header className={`site-header${menuOpen ? ' menu-open' : ''}`}>
    <a href="#top" className="brand" aria-label="大米的小站，返回首页" onClick={() => navigate('about')}><span className="brand-mark"><img src="/assets/rice-bowl-icon.png" alt="" /></span><span>大米的小站</span></a>
    <nav className="site-nav" id="site-nav" aria-label="主导航"><a href="#top" className={activeSection === 'about' ? 'is-active' : ''} aria-current={activeSection === 'about' ? 'location' : undefined} onClick={() => navigate('about')}>关于</a><a href="#writing" className={activeSection === 'writing' ? 'is-active' : ''} aria-current={activeSection === 'writing' ? 'location' : undefined} onClick={() => navigate('writing')}>文章</a><a href="#journey" className={activeSection === 'journey' ? 'is-active' : ''} aria-current={activeSection === 'journey' ? 'location' : undefined} onClick={() => navigate('journey')}>经历</a><a href="#life" className={activeSection === 'life' ? 'is-active' : ''} aria-current={activeSection === 'life' ? 'location' : undefined} onClick={() => navigate('life')}>生活</a><a href="mailto:hello@example.com" className="mobile-contact" onClick={() => setMenuOpen(false)}>联系我</a></nav>
    <a href="mailto:hello@example.com" className="contact-link">联系我</a>
    <button className="menu-toggle" type="button" aria-controls="site-nav" aria-expanded={menuOpen} aria-label={menuOpen ? '关闭导航' : '打开导航'} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
  </header>
}

function Hero() {
  return <section className="hero" id="top">
    <div className="hero-copy">
      <h1><span className="hero-name">我是大米</span><span className="focus-line"><span className="focus-row">专注 <em>职场</em> <b className="hero-separator">+</b> <em>法律</em> <b className="hero-separator">+</b></span><span className="focus-row"><em>个人成长</em> <b className="hero-separator">+</b> <em>AI</em></span></span></h1>
      <p className="hero-description">记录观察、思考与正在发生的生活。 <span>愿每一次微小的积累，都有回响。</span></p>
      <div className="hero-actions">
        <a className="button button-dark" href="#writing">阅读文章 <Arrow /></a>
        <a className="button button-light" href="#about">查看简历 <Arrow down /></a>
      </div>
    </div>
    <div className="hero-art" aria-label="戴着黄头巾、手捧 lifelong learning 书本的插画">
      <img src="/assets/sumin-reading-v2-cutout.png" alt="大米阅读 lifelong learning 书本的插画" />
    </div>
  </section>
}

function Articles({ articles, onOpen }) {
  return <section className="writing" id="writing"><div className="writing-inner section" data-reveal>
    <div className="section-heading"><div><p className="section-kicker">WRITING</p><h2>最新文章</h2></div><a href="#writing" className="text-link">查看全部 <Arrow /></a></div>
    <div className="article-list">
      {articles.map((article, index) => <button className="article" type="button" onClick={() => onOpen(article)} key={article.id}><span className="article-no">0{index + 1}</span><div className="article-meta"><time>{article.date}</time><span>{article.category}</span></div><div className="article-body"><h3>{article.title}</h3><p>{article.excerpt}</p></div><span className="round-arrow" aria-hidden="true"><Arrow /></span></button>)}
    </div>
  </div></section>
}

function ArticleReader({ article, onClose }) {
  const [markdown, setMarkdown] = useState('')
  const [status, setStatus] = useState('loading')
  const closeButtonRef = useRef(null)

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
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  if (!article) return null
  return <div className="reader-overlay" role="dialog" aria-modal="true" aria-labelledby="article-title">
    <article className="reader-panel">
      <header className="reader-header"><div><p className="section-kicker">{article.category} · {article.date}</p><h2 id="article-title">{article.title}</h2></div><button ref={closeButtonRef} className="reader-close" type="button" onClick={onClose} aria-label="关闭文章">×</button></header>
      <div className="reader-actions"><button type="button" onClick={onClose}>返回文章列表 <Arrow /></button></div>
      {status === 'loading' && <p className="reader-status">正在载入全文…</p>}
      {status === 'error' && <p className="reader-status">正文载入失败，请稍后再试。</p>}
      {status === 'ready' ? <div className="reader-content"><Suspense fallback={<p className="reader-status">正在排版正文…</p>}><Markdown>{markdown}</Markdown></Suspense></div> : null}
    </article>
  </div>
}

function Journey() {
  return <section className="journey" id="journey"><div className="journey-inner section" data-reveal>
    <div className="journey-intro"><p className="section-kicker">JOURNEY</p><h2>我的升级打怪之路</h2><p>不是一条预先规划好的路线。每走一段，我都把当时解决问题的方法留了下来。</p></div>
    <ol className="journey-timeline">{journeyItems.map((item) => <li className="journey-item" key={item.title}><div className="journey-date">{item.date}</div><div className="journey-detail"><h3>{item.title}</h3><p>{item.description}</p><div className="journey-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></li>)}</ol>
  </div></section>
}

function Life() {
  return <section className="life" id="life"><div className="life-shell" data-reveal><div className="life-heading"><p className="section-kicker">LIFE &amp; INTERESTS</p><h2>我的生活与爱好</h2><p>把鼠标放到文件夹上，看看工作之外的我。</p></div><div className="interest-wall"><figure className="interest interest-wellness"><img src="/assets/life-stickers/wellness.png?v=20260906b" alt="抱着爱心的女孩贴纸" /><figcaption>保持热爱</figcaption></figure><figure className="interest interest-reading"><img src="/assets/life-stickers/reading.png?v=20260906b" alt="阅读的女孩贴纸" /><figcaption>阅读输入中</figcaption></figure><figure className="interest interest-badminton"><img src="/assets/life-stickers/badminton.png?v=20260906" alt="打羽毛球的女孩贴纸" /><figcaption>挥拍一下</figcaption></figure><figure className="interest interest-swimming"><img src="/assets/life-stickers/swimming.png?v=20260906" alt="游泳的女孩贴纸" /><figcaption>自在游弋</figcaption></figure><figure className="interest interest-hiking"><img src="/assets/life-stickers/hiking.png?v=20260906" alt="爬山的女孩贴纸" /><figcaption>向山而行</figcaption></figure></div></div></section>
}

function About() {
  return <section className="about section" id="about"><div className="about-copy" data-reveal><p>我是大米，一名持续学习、持续书写的人。这里收纳我的行业观察、生活手记，以及关于工作的长期思考。</p><a href="mailto:hello@example.com" className="text-link">认识一下 <Arrow /></a></div></section>
}

function App() {
  const [articles, setArticles] = useState([])
  const [activeArticle, setActiveArticle] = useState(null)
  const [activeSection, setActiveSection] = useScrollSpy()
  useSectionReveal()
  useEffect(() => {
    fetch('/articles/index.json')
      .then((response) => response.ok ? response.json() : [])
      .then(setArticles)
      .catch(() => setArticles([]))
  }, [])
  return <><Header activeSection={activeSection} onNavigate={setActiveSection} /><main><Hero /><Articles articles={articles} onOpen={setActiveArticle} /><Journey /><Life /><About /></main><footer><div className="footer-inner">© {new Date().getFullYear()} 大米的小站 <span>Keep learning, keep growing.</span></div></footer>{activeArticle ? <ArticleReader article={activeArticle} onClose={() => setActiveArticle(null)} /> : null}</>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
