# 个人技术博客

这是一个使用Next.js和TailwindCSS构建的个人技术博客网站，具有黑色主题风格。

## 功能特性

- 响应式设计，适配各种屏幕尺寸
- 黑色主题UI，提供良好的阅读体验
- 博客文章管理系统
- AI聊天功能
- 个性化设置选项

## 技术栈

- Next.js - React框架
- TailwindCSS - 样式解决方案
- React - 前端库

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看结果。

## 部署到生产环境

### Vercel部署（推荐）

最简单的部署方法是使用[Vercel平台](https://vercel.com)，Vercel是Next.js的创建者。

1. 注册Vercel账号并连接GitHub仓库
2. 导入项目
3. Vercel会自动检测Next.js项目并使用最佳配置部署

### 其他平台部署

也可以部署到其他支持Node.js的平台:

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### Docker部署

本项目配置了`standalone`输出选项，可以轻松创建Docker容器:

```dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 运行应用
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 环境变量

创建`.env.local`文件设置环境变量:

```
# 示例环境变量
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
API_KEY=your_api_key
```

## 许可证

MIT 