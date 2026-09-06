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

文章正文统一放在 `public/articles/`，使用 UTF-8 编码的 `.md` 文件。标题、二级标题、列表、引用和链接等标准 Markdown 语法都会按网站样式显示。

新增文章时：

1. 在 `public/articles/` 新建文件，例如 `my-new-article.md`。
2. 在 `public/articles/index.json` 顶部添加一条文章信息，填写 `id`、`date`、`category`、`title`、`excerpt` 和 `content`。其中 `content` 填写 `/articles/my-new-article.md`。
3. 提交并推送到 GitHub；Vercel 会自动发布。

正文可以用 `# 标题` 开头，但网站阅读页已经显示文章标题，因此该一级标题不会重复显示。
