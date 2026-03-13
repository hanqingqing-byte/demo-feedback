# Demo Feedback MVP

一个基于 Next.js 的设计 Demo 分享与反馈网站，支持：

1. 设计师上传多张设计图创建 Demo
2. 生成公开分享链接
3. 访客在手机或电脑端浏览 Demo
4. 访客提交文字建议
5. 设计师在后台查看反馈
6. 设计师登录后管理自己的 Demo
7. 删除 Demo

## 本地启动

1. 安装依赖

```bash
npm install
```

2. 如需启用登录和 Supabase 持久化，先复制环境变量：

```bash
cp .env.example .env.local
```

3. 启动开发环境

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

默认访问地址：

- 后台首页: `http://localhost:3000/`
- 新建 Demo: `http://localhost:3000/new`

## 环境变量

启用正式版能力时需要这些变量：

1. `NEXT_PUBLIC_SITE_URL`
2. `NEXT_PUBLIC_SUPABASE_URL`
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`

## Supabase 初始化

1. 在 Supabase 控制台创建项目
2. 打开 SQL Editor，执行 [supabase/schema.sql](/Users/hanqingqing/Desktop/评估分析/demo-feedback-mvp/supabase/schema.sql)
3. 在 Authentication 里开启 Email OTP / Magic Link
4. 在 URL 配置里加入本地回调地址：`http://127.0.0.1:3000/auth/callback`

## 数据存储

项目支持两种模式：

1. 未配置 Supabase 时：
   - Demo 和反馈数据保存在 `data/db.json`
   - 上传图片保存在 `public/uploads`
2. 配置 Supabase 后：
   - Demo、图片索引和反馈保存在 Supabase
   - 实际图片上传到公开 bucket `demo-images`

这意味着：

1. 本地模式适合快速验证流程
2. Supabase 模式适合继续往正式版推进
3. 本地模式不适合直接上线生产

## 后续建议

如果你继续做下一版，我建议优先补：

1. 反馈筛选和状态管理
2. “针对某一张图提建议”
3. 企业微信登录
4. 反馈通知
