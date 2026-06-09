# JLPT Sprint Desk

🎯 **在线地址：** [https://jlpt-sprint-desk.vercel.app](https://jlpt-sprint-desk.vercel.app)

一个基于 React + TypeScript 的日语学习计划工作台，专为 JLPT（日本语能力测试）备考设计。通过倒计时驱动的计划生成、每日学习记录与智能复盘分析，帮助考生建立可持续的备考节奏。

## 功能特性

- **学习总览**：考试倒计时、今日目标、累计投入时长、下一步行动建议
- **计划设置**：目标等级、考试日期、每日时间预算、教材偏好、薄弱模块与学习阻碍
- **智能计划**：一键生成基于考试倒计时的个性化学习计划（含阶段划分）
- **每日记录**：模块用时与数量追踪、完成度、正确率、错因分析与明日第一步
- **复盘分析**：7 天趋势图、模块投入饼图、错因统计、计划健康评分与改进建议
- **导出备份**：Markdown 计划导出、CSV 数据导出、完整备份 JSON、打印友好视图
- **档案管理**：多档案隔离，支持备份导出与完整恢复
- **移动端适配**：响应式布局 + 底部导航栏

## 技术栈

- **前端**：React 19 + TypeScript + Vite
- **路由**：React Router 7 (Hash Router)
- **样式**：纯 CSS (无 UI 框架，基于自定义 CSS 变量系统)
- **图表**：基于 SVG 的自定义图表组件
- **图标**：Lucide React
- **状态管理**：React Context + localStorage 持久化
- **部署**：静态构建产物（`dist/`）可直接部署到任意静态托管服务

## 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/panda-pig/jlpt-sprint-desk.git
cd jlpt-sprint-desk

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建部署

```bash
# 生产构建
npm run build

# 构建产物位于 dist/ 目录，可直接部署
```

### 代码检查

```bash
# ESLint 检查
npm run lint
```

### 云同步（可选）

默认纯本地模式（数据只存浏览器 localStorage）。如需跨设备同步与备份，可接入自己的 Supabase 项目：

1. 在 [supabase.com](https://supabase.com) 创建免费项目
2. 在项目的 SQL Editor 里运行 `supabase/schema.sql`
3. 从 Project Settings → API 复制 URL 和 anon key
4. 复制 `.env.example` 为 `.env`，填入：

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

配置后，计划设置页会出现「云同步」面板，使用 Magic Link 邮箱登录即可自动跨设备同步（last-write-wins，按 `updated_at` 取最新）。未配置时该面板自动隐藏，应用照常以本地模式运行。

## 项目结构

```
src/
├── pages/          # 页面组件
│   ├── DashboardPage.tsx
│   ├── SetupPage.tsx
│   ├── PlanPage.tsx
│   ├── RecordPage.tsx
│   ├── AnalysisPage.tsx
│   └── ExportPage.tsx
├── components/     # 共享组件
│   ├── AppLayout.tsx
│   ├── BottomNav.tsx
│   ├── Charts.tsx
│   └── ...
├── lib/            # 工具库与业务逻辑
│   ├── planner.ts      # 计划生成算法
│   ├── storage.ts      # localStorage 封装
│   ├── useStudyDesk.tsx # 全局状态管理
│   ├── utils.ts        # 工具函数
│   └── types.ts        # TypeScript 类型定义
├── styles-original.css  # 核心样式（CSS 变量系统）
└── App.tsx         # 根组件
```

## 核心设计理念

- **数据隐私**：默认所有数据存储在浏览器 localStorage，不上传服务器；云同步为可选项，由用户自行接入私有 Supabase 项目
- **快速反馈**：记录表单控制在 2 分钟内完成
- **可复盘**：每日记录自动汇总为周/月趋势分析
- **可调整**：计划支持每日微调，不覆盖原始生成计划

## 许可证

[MIT](LICENSE)

---

*Designed for focused JLPT preparation.*