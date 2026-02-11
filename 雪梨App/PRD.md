# 雪梨App (Xueli App) 产品需求文档 (PRD)

**版本号**: V1.0  
**状态**: 草稿  
**最后更新日期**: 2026-02-10  

---

## 1. 产品概述 (Product Overview)

### 1.1 产品背景
随着AI大模型技术的发展，读者对于内容消费的需求已从单纯的“阅读”升级为“互动”与“陪伴”。传统的网文/漫画平台缺乏深度的角色互动能力，而纯粹的AI聊天软件又缺乏丰富的故事背景支撑。“雪梨App”旨在填补这一空白，连接内容创作者与读者，打造一个“可对话的故事世界”。

### 1.2 核心价值
*   **对创作者**: 提供作品发布平台，并通过AI角色赋予作品二次生命，增加变现渠道（阅读+互动）。
*   **对读者**: 提供沉浸式的阅读体验，能够与喜爱的角色进行跨越次元的实时对话，获得情感陪伴。
*   **对平台**: 通过连接供需双方，构建高粘性的内容社区，实现长期盈利。

### 1.3 核心Slogan
**与故事相遇，与灵魂对话。**

---

## 2. 用户角色 (User Personas)

| 角色 | 描述 | 核心诉求 |
| :--- | :--- | :--- |
| **内容创作者 (Author)** | 小说家、剧本写手、同人作者 | 发布作品、设定角色性格、获得创作收益、与粉丝互动。 |
| **读者 (Reader)** | 网文爱好者、二次元用户、情感需求用户 | 阅读优质故事、与角色聊天（恋爱/冒险/吐槽）、获得个性化体验。 |
| **运营管理员 (Admin)** | 平台运营人员 | 内容审核、数据监控、活动运营、结算管理。 |

---

## 3. 功能需求 (Functional Requirements)

### 3.1 创作者端 (Author Side)

#### 3.1.1 作品管理
*   **创建作品**: 支持上传封面、填写标题、简介、标签（如：古风、科幻、恋爱）。
*   **章节管理**: 支持文本编辑器，分章节发布内容，支持设置付费章节。
*   **数据看板**: 查看阅读量、收藏量、角色对话数、总收益。

#### 3.1.2 角色工坊 (Character Studio) [核心]
*   **角色创建**:
    *   **基础信息**: 姓名、头像、立绘（支持多表情）。
    *   **人设设定 (Persona)**: 详细的性格描述、背景故事、口癖、经典台词。
    *   **对话风格 (Style)**: 设定回复的长度、语气（高冷/热情/傲娇）、是否使用Emoji。
    *   **知识库 (Knowledge)**: 关联作品中的世界观设定，确保角色不OOC (Out Of Character)。
*   **调试预览**: 作者可以在发布前与AI角色进行测试对话，微调Prompt。

### 3.2 读者端 (Reader Side)

#### 3.2.1 发现与阅读
*   **首页推荐**: 基于算法推荐热门作品、新晋角色。
*   **沉浸式阅读器**:
    *   支持自定义字体、背景。
    *   **文中互动**: 阅读过程中，点击文中出现的角色名或头像，可直接发起私聊。
    *   **弹幕/评论**: 传统的段评功能。
    *   **沉浸式交互模式 [核心实现]**:
            *   **旁白展示 (Narration)**: 以全屏或卡片形式展示叙述性文字，作为剧情推进的基础，必须确保所有非对话文本均以旁白形式呈现。
            *   **多角色气泡对话 (Multi-character Bubble)**: 区分主角（右侧气泡，渐变色）与NPC（左侧气泡，白色/灰色），带头像展示。
            *   **角色发现机制 (Character Discovery)**: 
                *   **神秘状态**: 未在剧情中正式登场的角色，头像显示为剪影（Silhouette），姓名显示为“???”，引发读者好奇。
                *   **解锁触发**: 当角色在剧情片段中首次发言或被提及后，自动解锁真实头像与姓名，并伴随“身份解密”动画效果。
            *   **角色切换与 @功能**: 
                *   **@角色切换**: 支持在阅读/聊天界面通过 @ 符号或点击头像切换当前的对话对象。
                *   **动态上下文**: 切换角色后，AI 聊天上下文应自动同步为该角色的性格与当前剧情记忆。
            *   **人物关系看板 (Relationship Dashboard)**: 
                *   **常驻仪表盘**: 位于输入框上方，实时展示当前对话角色的姓名、好感度等级、关系称号及数值进度条。
                *   **即时反馈**: 当好感度发生变化时，播放全屏粒子特效（如心形动画）并伴随屏幕微震，强化成就感。
            *   **抉择系统 (Choice System) [可玩性核心]**: 
                *   **关键决策点**: 在剧情分歧处，通过悬浮按钮形式提供 2-3 个有意义的选择。
                *   **非线性叙事**: 不同的选择将导向差异化的剧情分支、隐藏片段或多重结局。
                *   **队列流转机制**: 采用段落队列 (Paragraph Queue) 技术管理分支剧情，支持多段落连续播放，确保分支体验与主线同样顺滑。
                *   **引导光效**: 当等待玩家做出决策时，选项按钮或输入框应显示“呼吸光效”引导操作。
            *   **心流与进度管理**:
                *   **进度可见性**: 顶部常驻细长进度条，显示当前章节的阅读完成百分比。
                *   **平滑过渡**: 章节结束处提供“开启下一章”引导按钮，确保阅读心流不中断。
                *   **快速跳过**: 支持长按屏幕快速跳过已读剧情，方便玩家探索不同分支。
            *   **有向无环图 (DAG) 状态管理**: 章节与片段之间通过 DAG 结构连接，支持非线性剧情跳转。
            *   **AI 创作模式 (AI Authoring Mode)**: 读者可切换至创作模式，输入自定义内容引导剧情走向。

        *   **MVP 核心玩法逻辑 (MVP Gameplay Loop)**:
            1.  **剧情推进 (The Hook)**: 采用“渐进式加载”，读者点击屏幕或输入指令触发下一段旁白/对话。
            2.  **关键决策 (The Choice)**: 剧情遇到分歧点，读者必须通过对话（或点击选项）与角色互动。
            3.  **关系突破 (The Reward)**: 互动行为影响好感度，触发“关系等级提升”特效。
            4.  **隐藏解锁 (The Secret)**: 高好感度解锁“专属片段”或“角色心声”，引导读者进入下一章。

#### 3.2.2 AI 角色互动 (Chat System)
*   **实时对话**: 支持文字、语音（TTS）对话。
*   **记忆系统**: 角色能记住读者的名字、之前的聊天内容以及共同经历的剧情。
*   **亲密度系统**:
    *   通过聊天时长、送礼提升亲密度。
    *   亲密度等级解锁专属语音、专属剧情、隐藏立绘。
*   **情景模式**: 支持“小剧场”模式，角色根据当前阅读章节的剧情背景与读者互动。

#### 3.2.3 个人中心
*   **书架**: 收藏的作品。
*   **好友列表**: 聊过天的角色列表（拟人化展示）。
*   **钱包**: 充值“雪梨币”，查看消费记录。

### 3.3 平台管理端 (Admin Side)
*   **内容审核**: 文本/图片自动+人工审核，确保合规。
*   **用户管理**: 封禁违规账号。
*   **财务结算**: 处理创作者提现申请。

---

### 开发工单 (Development Ticket)
**项目：** 雪梨App - 互动可玩性优化
**目标：** 修复审计报告中所有高、中优先级问题，提升剧情交互体验。

| 任务ID | 关联的报告问题 | 任务描述 (What) | 具体实现要求与技术细节 (How) | 待修改的文件/代码位置 |
| :--- | :--- | :--- | :--- | :--- |
| TASK-01 | 选择缺乏实质影响 | 引入预设决策选项 UI 按钮组 | 1. 在 `mobile_preview.html` 中新增 `currentChoices` 模板，当段落包含 `choices` 时，在底部悬浮显示按钮。<br>2. 点击按钮触发 `handleChoice(choice)`，将 `choice.nextParagraphs` 推入 `paragraphQueue`。<br>3. 验收标准：选项按钮点击有缩放反馈，点击后选项消失并触发后续剧情。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的 `loadNextParagraph` 逻辑及 UI 渲染部分。 |
| TASK-02 | 进度感知缺失 | 实现顶部全局阅读进度条 | 1. 在 `header` 下方添加高度为 2px 的 `bg-sherry-500` 进度条。<br>2. 宽度计算公式：`(currentParagraphIndex / totalParagraphs) * 100%`。<br>3. 验收标准：进度条平滑增长，切换章节时重置。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的顶层 UI 结构。 |
| TASK-03 | 互动引导不足 | 为“继续”按钮添加呼吸引导特效 | 1. 使用 Tailwind 的 `animate-pulse` 类，在剧情停顿等待玩家点击时动态绑定。<br>2. 验收标准：当 `currentChoices` 为空且未到章节末尾时，“继续”按钮呈现呼吸闪烁效果。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的“继续”按钮元素。 |
| TASK-04 | 剧情切换生硬 | 实现章节末尾“下一章”引导卡片 | 1. 当 `currentParagraphIndex` 达到数组长度且队列为空时，渲染一个全宽卡片，包含“恭喜读完本章”提示及“开启下一章”按钮。<br>2. 按钮点击调用 `initializeChapter(nextIndex)`。<br>3. 验收标准：卡片带有淡入动画，避免剧情突兀中断。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的剧情列表末尾模板。 |
| TASK-05 | 情感反馈平淡 | 增加好感度提升全屏动效反馈 | 1. 实现 `showIntimacyChange` 状态，当好感度变动时，在屏幕中央弹出带有 `animate-bounce` 的心形图标和状态文字。<br>2. 验收标准：动效持续 3 秒后自动消失，不遮挡阅读操作。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的全局弹窗逻辑。 |
| TASK-06 | 角色发现缺乏仪式感 | 实现角色解锁“身份解密”视觉转换 | 1. 在 `getCharacterAvatar` 中，当 `isDiscovered` 变为 `true` 时，为 `img` 标签添加 `grayscale-0` 和 `scale-110` 的过渡动画。<br>2. 验收标准：角色头像由灰色剪影平滑转为彩色，并伴有短暂光效。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的 `getCharacterAvatar` 函数及相关 CSS 类。 |
| TASK-07 | 对话一致性风险 | 引入角色化 Prompt 回复模板 | 1. 修改 `handleSend` 中的模拟回复逻辑，从 `activeCharacter.persona` 中提取前 10 个字符作为语气助词前缀。<br>2. 验收标准：AI 的自动回复（如“你说得很有道理”）会带上角色的性格标签。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的 `handleSend` 模拟回复部分。 |
| TASK-08 | 单线剧情局限 | 完善分支跳转与队列播放逻辑 | 1. 在 `handleChoice` 中，除了将 `nextParagraphs` 推入队列，还需检查是否有 `targetParagraph` (DAG 跳转)。<br>2. 验收标准：支持跳过某些段落直接进入指定剧情点，实现真正的非线性体验。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的 `paragraphQueue` 处理逻辑。 |
| TASK-09 | N/A (审计方案 B) | 常驻关系仪表盘 (Relationship Dashboard) | 1. 在输入框上方固定一个毛玻璃质感的横条，显示 `activeCharacter.name` 和好感度等级进度条。<br>2. 验收标准：随角色切换动态更新，点击可弹出详细关系描述。 | [mobile_preview.html](file:///Users/luwen/Documents/trae_projects/grafa/雪梨App/web-app/public/mobile_preview.html) 的输入区域上方。

---

## 4. 商业化与盈利模式 (Monetization Strategy)

目标是实现创作者、平台双赢，并让读者觉得物有所值。

### 4.1 货币体系
*   **代币名称**: 雪梨币 (Sherry Coin)
*   **兑换比例**: 1元人民币 = 10 雪梨币

### 4.2 盈利点
1.  **章节付费**: 传统网文模式，后续章节需消耗雪梨币解锁。
2.  **AI 对话付费**:
    *   **体力制**: 每日免费赠送一定对话次数。
    *   **按量付费**: 消耗雪梨币购买额外的对话次数。
    *   **订阅制 (VIP)**: 月卡/年卡用户无限畅聊，或拥有专属高级模型（更聪明、更拟人）。
3.  **虚拟礼物**: 读者给角色送礼（鲜花、奶茶、跑车），增加亲密度。
    *   *分成逻辑*: 礼物收益由平台与创作者按比例分成（如 5:5）。
4.  **角色定制**: 付费解锁角色的特定皮肤、语音包。

---

## 5. UI/UX 设计规范 (Design Guidelines)

### 5.1 设计理念
*   **风格**: 清新、治愈、轻量化。避免繁杂的干扰，突出“内容”与“人”。
*   **关键词**: `沉浸感 (Immersion)`, `连接 (Connection)`, `温暖 (Warmth)`.

### 5.2 视觉规范
*   **主色调**: 
    *   **雪梨橙 (Sherry Orange)**: `#FF8A65` (用于按钮、高亮、提示，代表活力与情感)
    *   **背景白**: `#FFFFFF` / `#F5F5F5`
    *   **文字黑**: `#333333`
*   **字体**: 优先使用圆角字体，增加亲和力。
*   **图标**: 线性图标为主，选中状态为面性填充。

### 5.3 关键页面布局
1.  **首页 (Home)**:
    *   顶部: 搜索栏 + 频道切换（推荐/榜单/新作）。
    *   Banner: 热门活动/强推作品。
    *   信息流: 卡片式布局展示作品，封面图占比大，突出角色立绘。
2.  **阅读页 (Reader)**:
    *   极简模式。
    *   右下角常驻“角色浮窗”，显示当前章节主要角色的Q版头像，点击即可展开聊天窗口（半屏覆盖）。
3.  **聊天页 (Chat)**:
    *   类似微信/IM界面。
    *   顶部显示角色名、亲密度心形进度条。
    *   底部输入框支持：文本、语音输入、发送礼物按钮、切换话题按钮。
    *   背景图: 根据角色设定自动匹配（如：校园、古代宫廷）。

---

## 6. 技术架构 (Technical Architecture)

### 6.1 客户端 (Client)
*   **框架**: Flutter (跨平台，高性能) 或 React Native。
*   **功能**: 界面渲染、本地缓存、即时通讯 (WebSocket)。

### 6.2 服务端 (Server)
*   **API 服务**: Golang / Python (FastAPI)。
*   **数据库**: 
    *   MySQL (用户、订单、作品元数据)。
    *   Redis (缓存、排行榜)。
    *   MongoDB (聊天记录，非结构化数据)。
    *   **Vector DB (向量数据库)**: Milvus / Pinecone (用于存储角色记忆、知识库，实现RAG)。

### 6.3 AI 引擎 (AI Engine)
*   **LLM 接入**: 接入主流大模型 API (OpenAI GPT-4, Claude 3, GLM-4 等)。
*   **Prompt 管理系统**: 动态组装 System Prompt（人设 + 当前剧情 + 历史记忆）。
*   **RAG 系统**: 检索相关剧情和记忆，作为 Context 喂给大模型。

---

## 7. 路线图 (Roadmap)

*   **Phase 1 (MVP)**: 核心阅读功能 + 基础AI对话 + 简单的角色创建。
*   **Phase 2**: 商业化系统上线（充值、礼物）、亲密度系统。
*   **Phase 3**: 语音对话、多模态互动（发送图片）、社区功能（同人二创）。

