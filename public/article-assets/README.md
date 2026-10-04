# 文章图片目录

每篇文章使用独立子目录：`public/article-assets/<文章ID>/cover.webp`。

线上地址为 `/article-assets/<文章ID>/cover.webp`，不能使用本地磁盘路径。
只存发布所需图片，生成原图、提示词和测试素材留在本机审核目录。
封面为 16:9 WebP，约 1200×675，目标 150–300KB；已有图片不得被静默覆盖。
完整用法见 `docs/MARKDOWN_AUTHORING.md`，是否生成配图由文章工作流的独立开关决定。
