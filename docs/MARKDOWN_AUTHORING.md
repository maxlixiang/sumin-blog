# 网站增强 Markdown 写作说明

普通文章继续使用 `public/articles/*.md` 与现有索引，无需增加格式字段。保留一个一级标题，与索引标题一致。现有 Markdown 文章自动获得表格、图片、脚注和任务清单支持。

本地启动 `npm run dev` 后，访问 `/articles/markdown-preview` 查看全部样式。预览使用 `docs/markdown-example.md`，不会进入文章列表，生产环境不提供这个预览页面。

## 表格、图片与脚注

使用 GitHub 风格的 Markdown 表格，列对齐使用 `:---`、`:---:`、`---:`。宽表格可在自己的区域横向滚动，键盘用户可以聚焦表格后使用左右键。

```markdown
| 指标 | 数值 |
| :--- | ---: |
| 门店 | 100 |

![图片说明](/article-assets/example/image.webp)

正文里的来源说明。[^source]

[^source]: 来源、日期与链接。
```

图片使用网站绝对路径，例如 `/article-assets/<文章ID>/image.webp`；本地磁盘路径无法供线上读者访问。图片说明应描述内容，图片会自动缩放并延迟加载。静态图表可保存为经过检查的 SVG 图片引用。

需要图注时：

```markdown
:::figure
![图表内容说明](/article-assets/example/chart.svg)

*图 1：图注及数据来源。*
:::
```

## 提示框与行内状态

```markdown
:::callout[需要注意]{type="warning"}
这里可以写正文、列表、链接和表格。
:::

项目状态：:status[进行中]{type="warning"}
```

`type` 支持 `note`、`warning`、`success`、`danger`，默认 `note`。提示框标题可以省略；状态文字应直接说明含义，不仅依靠颜色。

## 数据卡片、时间线与双栏

外层使用四个冒号，内层使用三个冒号，避免嵌套结束标记混淆。区块之间保留空行。

```markdown
::::metrics
:::metric
**2,500+**

全球门店

数据截止时间与口径。
:::
:::metric
**7 国**

覆盖市场
:::
::::

::::timeline
:::event
**2024 年 4 月**

首个试点开业。
:::
:::event
**2025 年**

扩大市场布局。
:::
::::

::::columns
:::panel
### 产品视角

第一栏内容。
:::
:::panel
### 合规视角

第二栏内容。
:::
::::
```

数据卡片首段用于突出数值，其余段落显示名称与说明。时间线首段用于日期，其余内容用于事件。卡片与双栏在手机端自动变成单列。

## 支持边界

扩展使用 `remark-gfm` 与 `remark-directive`，文章渲染器仍按需加载。扩展仅识别本文列出的名称和 `type`，不开放任意 HTML、脚本、样式或事件属性。普通引用、列表和链接的写法不变。

这一层适合静态调研文章，不包含动态 ECharts、合并单元格、任意页面布局或 HTML 导入。需要这些能力时再进入下一层。
