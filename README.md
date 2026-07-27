# Mental Seal · 思想钢印

> *"面壁者希恩斯发明的思想钢印，能将一个信念不可逆地刻入大脑。"*
> *——《三体 II · 黑暗森林》*

**你的 AI Agent 也有"健忘症"。** 对话超过几十轮，它就忘了你是谁、项目要做什么、哪些红线不能碰。三层记忆？压缩即失忆。每轮硬塞 1000 token？烧钱且脆弱。

**思想钢印给出终极解法：把核心目标刻进 system prompt 的不可压缩前缀。** 就像钢印刻入神经元——对话再长、压缩再狠，信念永在。

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
