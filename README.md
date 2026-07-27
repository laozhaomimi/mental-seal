# Core Goal Sidebar

VS Code 侧边栏扩展：管理 AI 编程助手的**核心目标**，确保每次会话都带着目标工作，永不遗忘。

## 原理

核心目标写入 `REASONIX.md`（Reasonix）/ `AGENTS.md`（Hermes）的 **system prompt 前缀区段**。
这个前缀在每次会话启动时自动注入，**不会被 compact 压缩**，从根本上解决"对话多了就忘"的问题。

## 三级作用域

| 级别 | 文件 | 说明 |
|------|------|------|
| 🌐 全局 | `%APPDATA%/reasonix/REASONIX.md` | 所有项目、每次会话 |
| 📁 工作区 | `<workspace>/.reasonix/REASONIX.md` | 当前项目，可提交 git |
| 🪟 窗口 | `<workspace>/.reasonix/REASONIX.local.md` | 仅本机，不提交 git |

## 两类目标

- **🎯 核心目标**：每次会话自动注入 system prompt，AI 永远记得
- **💡 一般目标**：存入 `goals.json`，生成 `/goals` skill，AI 按需查看，不占每轮 token

## 使用

1. 安装后点击活动栏的 🎯 图标
2. 在侧边栏编辑面板中切换作用域/类型
3. 每行一条目标，点击保存
4. 状态栏显示当前生效的核心目标数量

## 安装

```bash
code --install-extension core-goal-sidebar-0.1.0.vsix
```

## 开发

```bash
npm install
npm run compile   # 编译
npm run watch     # 监听模式
npm run package   # 打包 VSIX
```
