import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import VideoEmbed from './VideoEmbed'
import './article-markdown.css'

const tones = new Set(['note', 'warning', 'success', 'danger'])
const containers = {
  callout: 'aside', metrics: 'div', metric: 'div', timeline: 'ol',
  event: 'li', columns: 'div', panel: 'div', figure: 'figure',
}

// Only map known directives and approved attributes into presentation markup.
function articleDirectives() {
  return (tree) => {
    function walk(node) {
      const attrs = node.attributes ?? {}
      if (node.type === 'leafDirective' && node.name === 'video') {
        node.data = { hName: 'video-card', hProperties: { 'data-video-url': attrs.url, 'data-video-title': attrs.title, 'data-video-start': attrs.start } }
      } else if (node.type === 'containerDirective' && Object.hasOwn(containers, node.name)) {
        const tone = tones.has(attrs.type) ? attrs.type : 'note'
        node.data = {
          hName: containers[node.name],
          hProperties: { className: `md-${node.name}${node.name === 'callout' ? ` md-${tone}` : ''}` },
        }
        if (node.name === 'figure') {
          if (attrs.type === 'cover') {
            node.data.hProperties.className += ' md-cover'
            const markCover = (child) => {
              if (child.type === 'image') {
                child.data = { ...child.data, hProperties: { ...child.data?.hProperties, width: 1200, height: 675, 'data-cover': 'true' } }
              }
              child.children?.forEach(markCover)
            }
            node.children?.forEach(markCover)
          }
          const caption = node.children?.at(-1)
          if (caption?.type === 'paragraph' && caption.children?.length === 1 && caption.children[0].type === 'emphasis') {
            caption.data = { hName: 'figcaption' }
          }
        }
      } else if (node.type === 'textDirective' && node.name === 'status') {
        const tone = tones.has(attrs.type) ? attrs.type : 'note'
        node.data = { hName: 'span', hProperties: { className: `md-status md-${tone}` } }
      }
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}

const plugins = [remarkGfm, remarkDirective, articleDirectives]
const components = {
  'video-card': ({ node }) => <VideoEmbed url={node.properties['data-video-url']} title={node.properties['data-video-title']} start={node.properties['data-video-start']} />,
  table: ({ children }) => <div className="md-table-scroll" tabIndex={0} role="region" aria-label="表格，可横向滚动"><table>{children}</table></div>,
  img: ({ src, alt, title, width, height, node }) => <img src={src} alt={alt ?? ''} title={title} width={width} height={height} loading={node.properties['data-cover'] === 'true' ? 'eager' : 'lazy'} decoding="async" />,
  // A figure's final italic paragraph is the authored image caption.
  figure: ({ children, className }) => <figure className={className ?? 'md-figure'}>{children}</figure>,
}

export default function ArticleMarkdown({ children }) {
  return <ReactMarkdown remarkPlugins={plugins} components={components}>{children}</ReactMarkdown>
}
