// This function is serialized into the isolated report; keep it self-contained.
export function runReport(config) {
  const charts = []
  let scheduled = false
  const notify = (type, extra = {}) => parent.postMessage({ channel: 'dami-report', token: config.token, type, ...extra }, '*')
  const sendHeight = () => {
    scheduled = false
    const body = document.body
    const style = getComputedStyle(body)
    const height = Math.ceil(body.getBoundingClientRect().height + parseFloat(style.marginTop || 0) + parseFloat(style.marginBottom || 0))
    notify('height', { height: Math.max(200, height) })
  }
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(sendHeight) }
  }
  new ResizeObserver(schedule).observe(document.body)
  document.querySelectorAll('img').forEach((img) => img.addEventListener('load', schedule))
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const rawId = link.getAttribute('href').slice(1)
      let target
      try { target = document.getElementById(decodeURIComponent(rawId)) } catch { return }
      if (!target) return
      event.preventDefault()
      notify('anchor', { top: target.getBoundingClientRect().top + window.scrollY })
    })
  })
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  function applyOptions(chart, spec) {
    const narrow = innerWidth < 640
    const mobile = narrow ? spec.mobileOption : undefined
    chart.setOption({
      ...spec.option,
      ...mobile,
      series: mobile?.series && Array.isArray(spec.option.series)
        ? spec.option.series.map((series, index) => ({ ...series, ...mobile.series[index] }))
        : spec.option.series,
      animation: !reduced.matches && spec.option.animation !== false,
      tooltip: { ...spec.option.tooltip, ...(narrow ? spec.mobileOption?.tooltip : {}), renderMode: 'richText', confine: true },
    }, { notMerge: true })
    chart.resize()
  }
  function initialize() {
    for (const spec of config.charts) {
      const el = document.getElementById(spec.id)
      if (!el) { notify('chart-error', { message: `找不到图表容器：${spec.id}` }); continue }
      try {
        el.replaceChildren()
        el.classList.add('dami-chart')
        el.style.height = `${spec.height || 360}px`
        el.setAttribute('role', 'img')
        el.setAttribute('aria-label', spec.label || '数据图表')
        const chart = echarts.init(el, null, { renderer: 'svg' })
        charts.push(chart)
        applyOptions(chart, spec)
        new ResizeObserver(() => { applyOptions(chart, spec); schedule() }).observe(el)
        reduced.addEventListener('change', () => applyOptions(chart, spec))
        if (spec.description) {
          const description = document.createElement('p')
          description.className = 'dami-chart-description'
          description.textContent = spec.description
          el.after(description)
        }
      } catch (error) {
        el.textContent = '图表暂时无法显示，请参阅下方数据说明。'
        notify('chart-error', { message: String(error) })
      }
    }
    schedule()
  }
  if (config.charts.length) {
    const script = document.createElement('script')
    script.src = config.echartsUrl
    script.nonce = config.nonce
    script.onload = initialize
    script.onerror = () => {
      config.charts.forEach((spec) => {
        const el = document.getElementById(spec.id)
        if (el) el.textContent = spec.description || '图表加载失败。'
      })
      notify('chart-error', { message: '图表资源加载失败' })
      schedule()
    }
    document.head.append(script)
  }
  window.addEventListener('pagehide', () => charts.forEach((chart) => chart.dispose()))
  schedule()
}
