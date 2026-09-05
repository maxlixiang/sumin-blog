import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const articles = [
  { date: '2026.08.26', category: '涉外法律', title: '国内涉外律师行业现状及两种发展方向', excerpt: '从真实业务、入行门槛、案源逻辑与细分赛道，拆解涉外律师职业选择。' },
  { date: '2026.08.18', category: '知识产权', title: '知识产权与人工智能', excerpt: 'AI 如何重构知识产权规则，并为涉外法律人才带来新的职业窗口。' },
  { date: '2026.08.09', category: '职业思考', title: '涉外律师认知升级', excerpt: '从客户价值、产业理解与规则变化，重新审视涉外法律的核心能力。' },
]

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
      <p className="intro-line">你好，我是苏敏</p>
      <h1>把日常写成<br /><em>长期主义</em></h1>
      <p className="hero-description">记录观察、思考与正在发生的生活。<br />愿每一次微小的积累，都有回响。</p>
      <div className="hero-actions">
        <a className="button button-dark" href="#writing">阅读文章 <Arrow /></a>
        <a className="button button-light" href="#about">查看简历 <Arrow down /></a>
      </div>
    </div>
    <div className="hero-art" aria-label="戴着黄头巾、手捧 lifelong learning 书本的插画">
      <span className="sparkle sparkle-top">✦</span><span className="sparkle sparkle-side">✦</span>
      <img src="/assets/sumin-reading.png" alt="思敏阅读 lifelong learning 书本的插画" />
    </div>
  </section>
}

function Articles() {
  return <section className="writing section" id="writing">
    <div className="section-heading"><div><p className="section-kicker">WRITING</p><h2>最新文章</h2></div><a href="#writing" className="text-link">查看全部 <Arrow /></a></div>
    <div className="article-list">
      {articles.map((article, index) => <article className="article" key={article.title}><span className="article-no">0{index + 1}</span><div className="article-meta"><time>{article.date}</time><span>{article.category}</span></div><div className="article-body"><h3>{article.title}</h3><p>{article.excerpt}</p></div><a className="round-arrow" href="#writing" aria-label={`阅读：${article.title}`}><Arrow /></a></article>)}
    </div>
  </section>
}

function Life() {
  return <section className="life section" id="life"><div className="life-top"><div><p className="section-kicker">LIFE LOG</p><h2>生活片段</h2></div><p>一些值得留存的光、路途与寻常日子。</p></div><div className="photo-strip">{photos.map((photo) => <div className={`photo ${photo.className}`} role="img" aria-label={photo.alt} key={photo.className} />)}</div></section>
}

function About() {
  return <section className="about section" id="about"><div><p className="section-kicker">ABOUT ME</p><h2>慢慢走，也认真记录。</h2></div><div className="about-copy"><p>我是思敏，一名持续学习、持续书写的人。这里收纳我的行业观察、生活手记，以及关于工作的长期思考。</p><a href="mailto:hello@example.com" className="text-link">认识一下 <Arrow /></a></div></section>
}

function App() { return <><Header /><main><Hero /><Articles /><Life /><About /></main><footer>© {new Date().getFullYear()} 苏敏的小站 <span>Keep learning, keep growing.</span></footer></> }

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
