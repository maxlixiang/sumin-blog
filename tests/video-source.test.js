import test from 'node:test'
import assert from 'node:assert/strict'
import { parseVideoSource } from '../src/video-source.js'

test('YouTube watch, short, live and short URL use canonical official endpoints', () => {
  for (const url of ['https://www.youtube.com/watch?v=M7lc1UVf-VE', 'https://youtu.be/M7lc1UVf-VE', 'https://youtube.com/shorts/M7lc1UVf-VE', 'https://m.youtube.com/live/M7lc1UVf-VE']) {
    assert.equal(parseVideoSource(url).embed, 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=0&playsinline=1&start=0')
  }
})
test('start time and Bilibili multi-part links are preserved, autoplay is disabled', () => {
  assert.match(parseVideoSource('https://youtu.be/M7lc1UVf-VE?t=1m35s').embed, /start=95$/)
  assert.match(parseVideoSource('https://youtu.be/M7lc1UVf-VE?t=1m35s', '12').embed, /start=12$/)
  const source = parseVideoSource('https://www.bilibili.com/video/BV1B7411m7LV/?p=2&t=50&autoplay=1')
  assert.equal(source.embed, 'https://player.bilibili.com/player.html?bvid=BV1B7411m7LV&p=2&t=50&autoplay=0')
})
test('untrusted domains, schemes, embed URLs and invalid IDs never create a player', () => {
  for (const url of ['javascript:alert(1)', 'http://youtu.be/M7lc1UVf-VE', 'https://youtube.com.evil.test/watch?v=M7lc1UVf-VE', 'https://youtube.com@evil.test/watch?v=M7lc1UVf-VE', 'https://user@youtube.com/watch?v=M7lc1UVf-VE', 'https://youtube.com:8443/watch?v=M7lc1UVf-VE', 'https://youtube.com/embed/M7lc1UVf-VE', 'https://youtu.be/short', 'https://bilibili.com/video/BV123', 'https://player.bilibili.com/player.html?bvid=BV1B7411m7LV', 'https://evil.test/video', '']) assert.equal(parseVideoSource(url), null, url)
})
