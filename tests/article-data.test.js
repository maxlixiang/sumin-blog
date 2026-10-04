import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const catalog = JSON.parse(readFileSync(new URL('public/article-data/index.json', root), 'utf8'))

test('article data does not occupy the page route directory', () => {
  assert.equal(existsSync(new URL('public/articles', root)), false)
  assert(catalog.length > 0)
  assert.equal(new Set(catalog.map(article => article.id)).size, catalog.length)
})

test('article metadata and UTF-8 resources remain readable', () => {
  for (const article of catalog) {
    assert.match(article.id, /^[\w-]+$/)
    assert.match(article.date, /^\d{4}\.\d{2}\.\d{2}$/)
    assert(article.title && article.category && article.excerpt)
    for (const resource of [article.content, article.charts].filter(Boolean)) {
      assert.match(resource, /^\/article-data\/[\w-]+\.(md|html|charts\.json)$/)
      const text = readFileSync(new URL('public' + resource, root), 'utf8')
      assert(text.length > 0)
      assert(!text.includes('\uFFFD'), resource)
      if (resource.endsWith('.json')) assert(Array.isArray(JSON.parse(text)))
    }
  }
})
