# HTML 专题与 ECharts 发布说明

网站现在支持普通 Markdown、增强 Markdown 和 HTML 专题。它们共用首页、文章列表、独立文章地址、返回列表和文章翻页。

本地启动 `npm run dev`，打开 `/articles/html-preview` 查看演示：完整 HTML 页头、指标卡片、可交互的环形图与折线图、合并单元格表格、文内跳转。预览不加入文章索引，也不出现在生产环境。

## 添加 HTML 专题

将 UTF-8 HTML 文件放入 `public/articles/`。支持含 `html/head/body` 的完整文档，也支持正文片段。完整报告保留自身页头与内联 CSS，显示在与网站隔离的 iframe 中；网站导航和翻页位于报告外面。

在 `public/articles/index.json` 加入：

```json
{
  "id": "example-report",
  "date": "2026.10.02",
  "category": "品牌调研",
  "title": "专题报告标题",
  "excerpt": "一句话摘要。",
  "format": "html",
  "content": "/articles/example-report.html",
  "charts": "/articles/example-report.charts.json"
}
```

没有动态图表时省略 `charts`。已有 Markdown 索引不需要增加字段，默认仍为 Markdown。

## 图片、样式与链接

- CSS 写在 HTML 的 `style` 标签中，保留报告自己的颜色和布局；外部 CSS 文件应在导入时合并到文档，不会直接加载外部样式表。
- 图片可以使用网站绝对路径，也可以相对于 HTML 文件引用。建议放入 `/article-assets/<文章ID>/`。不能使用本机磁盘路径。
- 普通图片自动限制在容器宽度内；内联静态 SVG 保留。
- 表格支持 `rowspan/colspan`，宽表格在自己的区域内滚动，可用键盘操作。
- `href="#章节ID"` 会定位到对应位置，并考虑顶部导航；外部链接在新标签页打开。
- iframe 高度根据报告内容变化更新，页面使用网站的纵向滚动。

## 动态 ECharts

原稿中的脚本会被移除。发布时将图表的数据和配置提取为 JSON，再由网站自己的 ECharts 运行入口初始化。这个过程不自动执行或转换第三方 JavaScript。

在 HTML 中预留容器和文本说明：

```html
<div id="market-chart" style="width:100%;height:360px">
  北美 25、东南亚 20、其他 15。
</div>
```

对应的 `.charts.json` 是数组：

```json
[
  {
    "id": "market-chart",
    "label": "市场分布图",
    "description": "数据截止时间、数值与来源说明。",
    "height": 360,
    "option": {
      "tooltip": { "trigger": "item" },
      "legend": { "bottom": 0 },
      "series": [{
        "type": "pie",
        "radius": ["40%", "65%"],
        "label": { "show": false },
        "data": [
          { "name": "北美", "value": 25 },
          { "name": "东南亚", "value": 20 },
          { "name": "其他", "value": 15 }
        ]
      }]
    },
    "mobileOption": {
      "legend": { "bottom": 0, "textStyle": { "fontSize": 11 } }
    }
  }
]
```

`id` 对应容器，`option` 为 JSON 格式的 ECharts 配置；`mobileOption` 在报告区域宽度小于640px时覆盖顶层选项。JSON 不支持函数，工具提示使用文本渲染。折线、柱状、饼图等无需自定义回调的配置可以使用。

图表随容器变化重新调整尺寸。用户启用“减少动态效果”时关闭图表动画。图例切换和提示数值仍可用。提供 `description`，让读者能够直接看到数据解释。

完整示例见 `docs/html-example.html` 和 `docs/html-example.charts.json`。

## 导入与验证

对于导出的网页，应先检查正文、CSS、资源路径、固定宽度、图表数据和编辑器残留。脚本、事件属性、表单和嵌套 iframe 不会执行；网站只运行自己的图表和尺寸同步入口。iframe 不授予同源权限，报告 CSS 不会改变网站导航。

两份茉莉奶白报告已加入正式文章目录，均标为“AI 共研”。HTML 文件原样复制保存；第一份作为静态 HTML 显示，第二份另附从原脚本提取的图表配置，以替换导出时捕获的固定宽度 SVG。正文不改写，原稿中的脚本不直接执行。

发布前按 UTF-8 回读，执行 `npm run build`，在桌面和手机上验证图例、提示框、图片、表格、文内跳转与返回列表。配置文件加载失败时仍显示 HTML 正文和预留数据说明；HTML 文件本身加载失败时显示正文加载错误。

ECharts 资源由项目打包并从网站本身加载，不依赖外部 CDN。只有 HTML 专题需要它，首页和 Markdown 文章不请求图表运行资源。

这里支持静态 HTML 排版与受控 ECharts 配置；需要登录、表单、任意脚本或其他应用交互的网页，应作为独立应用处理。

YouTube／B站视频使用 `div[data-video-url]` 标记，由网站受控播放器渲染，具体见 `docs/VIDEO_AUTHORING.md`。原稿中的任意 iframe 仍不会执行。
