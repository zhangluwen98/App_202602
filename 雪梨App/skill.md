# 雪梨App 开发方法论与技术沉淀 (Skill.md)

## 1. 核心架构模式：前后端分离与资源自治

### 1.1 架构理念
采用“静态页面 + 独立 API 服务”的架构模式。前端负责交互逻辑与渲染（Alpine.js / React），后端负责数据持久化、复杂业务逻辑与 AI 接口集成。

### 1.2 资源隔离规范
*   **静态资源**: 放在前端 `public` 或 `assets` 目录，通过 CDN 或 Web 服务器分发。
*   **业务数据 (JSON/DB)**: 必须存储在后端 `server/data` 或数据库中，通过标准 RESTful API 暴露。
*   **目的**: 提高安全性，支持多端共用一套数据源，便于创作者动态更新内容而无需重新发布前端。

## 2. 移动端优先开发 (Mobile-First) 技巧

### 2.1 适配与兼容性
*   **Safe Area**: 使用 `viewport-fit=cover` 和 `env(safe-area-inset-bottom)` 处理全面屏适配。
*   **Honor/Huawei 浏览器修复**:
    *   `honor-flex-fix`: 显式设置 `display: -webkit-box !important` 解决部分旧内核 Flex 布局失效。
    *   `honor-avatar-fix`: 为圆角头像容器设置 `overflow: hidden` 确保在旧版 WebView 中生效。
*   **交互优化**: 使用 `-webkit-tap-highlight-color: transparent` 移除点击高亮，提升原生感。

## 3. 沉浸式互动阅读实现方案

### 3.1 剧情数据结构 (DAG 模式)
*   **Paragraphs & Parts**: 将文本拆分为 `text`（旁白）和 `dialogue`（对话）两类。
*   **Extended Paragraphs**: 通过 `dialogueTriggers` 实现条件分支，根据对话次数或关键词触发隐藏片段。

### 3.2 渲染策略
*   **旁白优先**: 所有非对话文本必须使用 `msg.type === 'story'` 渲染，以区别于即时聊天气泡。
*   **气泡动态化**: 主角气泡居右（渐变背景），NPC 气泡居左（白色背景），通过 `characterId` 动态关联头像。

## 4. 常见 Bug 修复与避坑指南

### 4.1 旁白渲染缺失
*   **现象**: 页面只显示对话，不显示背景叙述。
*   **原因**: 渲染逻辑中对 `msg.type` 判断不全，或者数据转换时未将 `paragraphs` 映射为 `story` 类型。
*   **对策**: 建立统一的消息模型，确保 `initializeChapter` 时完整遍历所有内容。

### 4.2 部署 404 路径问题
*   **原因**: GitHub Pages 或子目录部署时，`base` 路径配置不一致。
*   **对策**: 在 `vite.config.js` 设置 `base`，并在 HTML 中使用相对路径或动态获取 `BASE_URL`。

## 5. 高效开发提示词 (Prompts) 优化
*   **Context Injection**: 在对话开始前，先同步最新的 PRD 核心功能点。
*   **Incremental Updates**: 每次修改后，要求总结当前改动并更新 TODO 列表。
*   **Validation First**: 实现新功能前，先运行 `GetDiagnostics` 检查语法和引用错误。
