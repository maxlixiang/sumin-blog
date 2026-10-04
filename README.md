# 大米的小站

一个使用 React 和 Vite 构建的个人博客首页，包含文章、生活片段与个人简介。

## 本地开发

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build
```

Vercel 可自动识别 Vite 项目并使用 `npm run build` 构建。

## 发布新文章

文章正文放在 `public/articles/`，使用 UTF-8 编码的 Markdown 或 HTML。纯文字、图片和常规表格可以用 Markdown；专题排版和动态图表可以用 HTML。

新增文章时：

1. 在 `public/articles/` 新建文件，例如 `my-new-article.md`。
2. 在 `public/articles/index.json` 顶部添加一条文章信息，填写 `id`、`date`、`category`、`title`、`excerpt` 和 `content`。其中 `content` 填写 `/articles/my-new-article.md`。
3. 提交并推送到 GitHub；Vercel 会自动发布。

首页会展示最新 3 篇文章，“查看全部”进入 `/articles`；每篇文章的 `id` 会生成独立地址，例如 `/articles/my-new-article`。

正文可以用 `# 标题` 开头，但网站阅读页已经显示文章标题，因此该一级标题不会重复显示。

## 内容与交互支持

- [增强 Markdown](docs/MARKDOWN_AUTHORING.md)：图片、图注、表格、提示框、指标与时间线。
- 可选文章封面：`:::figure{type="cover"}` 支持 16:9 WebP、尺寸预留和首图立即加载；资源按文章存入 `public/article-assets/<文章ID>/`。无图文章布局不变，不自动为旧文配图。
- [HTML 专题与 ECharts](docs/HTML_AUTHORING.md)：隔离排版、受控动态图表，不执行原稿脚本。
- [文章来源](docs/ARTICLE_SOURCES.md)：原创／转载／AI 共研，与主题分类分开。
- [视频引用](docs/VIDEO_AUTHORING.md)：YouTube／B站，点击后加载官方播放器、不自动播放，始终保留原站链接。Markdown 与 HTML 使用同一套卡片；不开放任意 iframe，不承诺登录或会员画质。
- 首页及文章页支持回到顶部，保留现有手机和平板布局。

现成终稿可以直接发布，不必调用文章编辑 Skill；只有要求核查、润色或改写时才进入编辑工作流。

视频能力更新于 2026-10-03。运行 `npm run test:video` 检查视频链接规则；运行 `npm run build` 检查生产构建。开发预览 `/articles/markdown-preview` 与 `/articles/html-preview` 包含视频示例，不进入正式文章列表。
