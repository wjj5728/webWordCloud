# Web3远程工作词频分析工具

一个用于分析web3和远程工作网站高频词汇的可视化工具，通过词云展示热门关键词。

## 功能特性

- 🔍 支持批量分析多个网站URL
- 📊 自动提取和统计高频词汇
- 🎨 美观的交互式词云可视化
- 🌐 支持中英文混合分词
- 📱 响应式设计，支持移动端
- 🌙 支持暗色模式

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **可视化**: react-wordcloud
- **HTTP客户端**: axios
- **HTML解析**: cheerio

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在[Vercel](https://vercel.com)导入项目
3. Vercel会自动检测Next.js项目并完成部署

或使用Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 使用说明

1. 在输入框中添加要分析的网站URL（每行一个）
2. 点击"开始分析"按钮
3. 等待分析完成，查看生成的词云图
4. 鼠标悬停在词云上可以查看词频详情

## 注意事项

- 一次最多可以分析10个URL
- 部分网站可能有反爬虫机制，可能无法正常抓取
- 建议使用公开可访问的网站URL

## 项目结构

```
web3Job/
├── app/
│   ├── api/
│   │   └── scrape/          # API路由
│   ├── page.tsx              # 主页面
│   ├── layout.tsx            # 布局组件
│   └── globals.css           # 全局样式
├── components/
│   ├── WordCloud.tsx         # 词云组件
│   ├── UrlInput.tsx          # URL输入组件
│   ├── LoadingSpinner.tsx    # 加载动画
│   └── ErrorDisplay.tsx      # 错误提示
├── lib/
│   ├── scraper.ts            # 网站抓取逻辑
│   ├── textProcessor.ts      # 文本处理
│   └── stopwords.ts          # 停用词列表
└── types/
    └── index.ts              # TypeScript类型定义
```

## 许可证

MIT
