# Mental Seal · 思想钢印

**长对话思维偏离终结者** —— 将核心目标刻入 system prompt 不可压缩区，三层记忆做不到的事，钢印一次搞定。

> *"面壁者希恩斯发明的思想钢印，能将一个信念不可逆地刻入大脑。"*
> *——《三体 II · 黑暗森林》*

**你的 AI Agent 有"思维偏离症"。** 对话超过几十轮，它就开始跑偏——忘了项目目标、违反架构约定、重复犯同一个错。你试过三层记忆（短期/长期/项目），试过每轮塞 1000 token 提醒，全都没用：**compact 一压缩，记忆全清零。**

这不是记忆问题，是**架构问题**。对话内容会被压缩，但 **system prompt 前缀永远不会**。

**思想钢印利用这个不可压缩区：把核心目标刻进 system prompt 的 cache-stable 前缀。** 就像钢印刻入神经元——对话再长、压缩再狠、上下文窗口再满，信念永在。这是目前唯一从架构层面根治长对话思维偏离的方案。

---

## ✨ 为什么叫思想钢印？

| 三体中的钢印 | 本扩展 |
|:---:|:---:|
| 将信念刻入大脑神经元 | 将目标刻入 system prompt 前缀 |
| 不可逆、不可删除 | 不会被 compact 压缩、不会随对话丢失 |
| 受印者永远坚信 | Agent 每次会话启动都"记得"核心目标 |

## 🏗️ 三级作用域

| 级别 | 写入文件 | 生效范围 |
|------|----------|----------|
| 🌐 全局 | `~/.config/reasonix/REASONIX.md` | 所有项目、所有会话 |
| 📁 工作区 | `<project>/.reasonix/REASONIX.md` | 当前项目，可提交 git 共享给团队 |
| 🪟 窗口 | `<project>/.reasonix/REASONIX.local.md` | 仅本机，不提交 git |

## 🎯 两类目标

- **核心目标（钢印）**：每次会话自动注入 system prompt，Agent 永远记得。
- **一般目标（记忆）**：存入 `goals.json`，生成 `/goals` skill，Agent 按需调用，不占每轮 token。

## 🚀 快速开始

```bash
# 安装
code --install-extension mental-seal-0.1.0.vsix
```

1. 点击活动栏的 🎯 图标，打开「思想钢印」侧边栏
2. 选择作用域（全局 / 工作区 / 窗口）
3. 每行写一条核心目标，点击 💾 保存
4. 完成。下一次 AI 会话启动时，目标已刻入。

## 🔧 开发

```bash
npm install
npm run compile   # 编译
npm run watch     # 监听模式
npm run package   # 打包 VSIX
```

## 📐 原理

Reasonix / Hermes 在每次会话启动时，会将 `REASONIX.md` / `AGENTS.md` 的内容折叠进 **system prompt 的 cache-stable 前缀**。这个前缀：

- ✅ 每轮都在，不随对话增长而稀释
- ✅ 不参与 compact 压缩
- ✅ 命中 provider 缓存，几乎零额外 token 成本

本扩展通过 `<!-- MENTAL-SEAL:START/END -->` 标记管理区段，**不会破坏你在同一文件中的其他内容**。

## 📄 License

MIT
