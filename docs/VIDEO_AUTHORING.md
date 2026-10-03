# 文章内视频引用

支持 YouTube 与哔哩哔哩的官方播放器，Markdown、HTML 共用视频卡片。仅在读者点击“加载视频”后请求平台，不自动播放，也不预取平台封面。加载完成后，读者在官方播放器中手动播放。

## Markdown

独占一行使用 `::video`：

```markdown
::video{url="https://www.youtube.com/watch?v=M7lc1UVf-VE" title="YouTube 播放器演示" start="35"}

::video{url="https://www.bilibili.com/video/BV1B7411m7LV/" title="B站视频引用"}
```

`url` 必填，`title` 建议填写，`start` 可选，单位为秒，也接受 `1m35s` 等时间格式。没有 `start` 时使用链接中的 `t` 或 `start`。B站多 P 视频可在链接中使用 `?p=2`。

## HTML

在正文需要插入视频的位置写一个标记，不要粘贴平台 iframe：

```html
<div data-video-url="https://www.youtube.com/watch?v=M7lc1UVf-VE"
     data-video-title="YouTube 播放器演示" data-video-start="35"></div>

<div data-video-url="https://www.bilibili.com/video/BV1B7411m7LV/"
     data-video-title="B站视频引用"></div>
```

HTML 正文仍在隔离 iframe 中。网站只识别这些 `div` 标记，预留位置，再由网站自身挂载与 Markdown 相同的播放器卡片；不放开原稿 iframe 或脚本，也不授予报告同源权限。播放器位于网站页面上下文，避免隔离正文的无来源身份影响 YouTube 播放请求。播放器引用策略为 `strict-origin-when-cross-origin`，只发送站点来源，不发送文章完整路径。

## 地址与安全边界

- 只接受 HTTPS 的 YouTube `watch`、`shorts`、`live`、`youtu.be` 链接，以及 B站 `/video/BV...` 链接。
- 根据合法视频 ID 重新生成官方播放器地址，不直接使用用户提供的 iframe 地址，不允许自定义播放器域名或任意参数。
- YouTube 使用 `youtube-nocookie.com`；这不是绝对匿名或登录权益保证，点击加载后仍会连接第三方服务。
- 视频 ID、链接格式无效或平台不支持时显示提示，不创建外部 iframe。
- 未登录／会员清晰度、广告、地区与网络限制、作者是否允许嵌入，由平台决定。本站不读取用户 Cookie、代替登录、解析下载或代理视频。
- 原站观看链接始终存在。跨站播放失败不能可靠地仅用 iframe `load` 事件识别；不将“iframe 已加载”宣称为“视频可播放”。

## 预览与验证

`npm run dev` 后访问 `/articles/markdown-preview` 和 `/articles/html-preview`。演示只在开发环境可见，不会加入正式文章列表。

`npm run test:video` 检查地址白名单和参数规则；`npm run build` 检查构建。浏览器检查应覆盖首次不连接平台、点击后加载、原站链接、键盘、手机布局，以及现有正文／表格／图表未被破坏。平台实际播放需在可访问平台的网络中另行验证，不保证任何登录或会员权益。

官方资料：[YouTube 嵌入与来源身份要求](https://developers.google.com/youtube/terms/required-minimum-functionality)、[B站外链播放器](https://player.bilibili.com/)。
