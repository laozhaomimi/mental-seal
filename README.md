# Mental Seal · 思想钢印

> 🔗 [中文](#中文) · [English](#english)

**AI长对话思维偏离终结者** — *The end of AI thought-drift in long conversations.*

---

## 中文

> *"面壁者希恩斯发明的思想钢印，能将一个信念不可逆地刻入大脑。"* ——《三体 II · 黑暗森林》

**你的 AI Agent 有"思维偏离症"。** 对话超过几十轮，它就开始跑偏——忘了项目目标、违反架构约定、重复犯同一个错。你试过三层记忆，试过每轮塞 1000 token 提醒：**compact 一压缩，记忆全清零。**

**思想钢印利用 system prompt 的不可压缩区：把核心目标刻进 cache-stable 前缀。** 对话再长、压缩再狠，信念永在。这是目前唯一从架构层面根治长对话思维偏离的方案。

### 🚀 三种用法

**方式一：Reasonix 对话管理（推荐 ⭐）**

直接在对话框里用自然语言操作：

| 你说 | 效果 |
|------|------|
| `显示钢印` | 列出全部钢印 |
| `加钢印：xxxx` | 添加到当前项目 |
| `加全局钢印：xxxx` | 添加到全局（所有项目生效） |
| `删钢印 3` | 删除第 3 条 |
| `停用钢印 2` | 停用（不注入 AI） |
| `启用钢印 2` | 重新激活 |

安装：把 `install/mental-seal-skill.md` 复制到 Reasonix 全局 skills 目录，重启即可。

**方式二：VS Code / Cursor 侧边栏**

```bash
code --install-extension mental-seal-0.1.0.vsix
```

点击活动栏 🎯 图标，侧边栏可视化管理：🌐 全局 / 📁 项目 / 🪟 窗口 三级作用域，☑ 逐条勾选，拖拽排序。

**方式三：直接编辑文件**

| 级别 | 文件 |
|------|------|
| 🌐 全局 | `%APPDATA%/reasonix/REASONIX.md` |
| 📁 项目 | `<项目>/.reasonix/REASONIX.md` |

改 `MENTAL-SEAL:START/END` 之间的 `- ` 行，保存即生效。

### ✨ 命名由来

| 三体中的钢印 | Mental Seal |
|:---|:---|
| 将信念刻入大脑神经元 | 将目标刻入 system prompt 前缀 |
| 不可逆、不可删除 | 不会被 compact 压缩 |
| 受印者永远坚信 | Agent 每次会话都"记得" |

### 📐 原理

Reasonix 每次会话启动时，将 `REASONIX.md` 折叠进 system prompt 的 **cache-stable 前缀**：不参与 compact、命中 provider 缓存、几乎零 token 成本。`<!-- MENTAL-SEAL:START/END -->` 标记管理区段。

---

## English

> *"The Mental Seal invented by Wallfacer Hines can engrave a belief irreversibly into the brain."* — *The Three-Body Problem II: The Dark Forest*

**Your AI agent drifts.** After dozens of turns, it forgets project goals, breaks architectural conventions, repeats mistakes. You tried three-layer memory. You tried injecting 1000 tokens every turn. **Compact erases it all.**

**Mental Seal exploits the uncompactable zone of the system prompt: it engraves core goals into the cache-stable prefix.** No matter how long the conversation, no matter how ruthless the compression, the seal holds. It is the only architectural solution to long-session thought-drift.

### 🚀 Three ways to use

**Option 1: Reasonix Chat (Recommended ⭐)**

Talk to the AI directly:

| You say | Result |
|---------|--------|
| `show seals` | List all seals |
| `add seal: xxxx` | Add to current project |
| `add global seal: xxxx` | Add globally (all projects) |
| `delete seal 3` | Remove seal #3 |
| `disable seal 2` | Pause (not injected) |
| `enable seal 2` | Reactivate |

Install: copy `install/mental-seal-skill.md` to Reasonix global skills directory, restart.

**Option 2: VS Code / Cursor Extension**

```bash
code --install-extension mental-seal-0.1.0.vsix
```

🎯 icon in the activity bar → full sidebar with three-level scope management, per-item toggles, drag-and-drop.

**Option 3: Edit files directly**

| Scope | File |
|-------|------|
| 🌐 Global | `%APPDATA%/reasonix/REASONIX.md` |
| 📁 Project | `<project>/.reasonix/REASONIX.md` |

Modify `- ` lines between markers. Save → next session picks it up.

### ✨ The name

| In the novel | In the extension |
|:---|:---|
| Engraves belief into neurons | Engraves goals into system prompt prefix |
| Irreversible, indelible | Survives compact, never lost |
| The sealed one never doubts | The agent never forgets |

### 📐 How it works

Reasonix folds `REASONIX.md` into the system prompt's **cache-stable prefix** at session start: compaction-proof, cache-hit-eligible, near-zero token cost. The `<!-- MENTAL-SEAL:START/END -->` markers ensure your other content stays untouched.

---

## 🔧 Development

```bash
npm install
npm run compile   # compile
npm run watch     # watch mode
npm run package   # package VSIX
```

## 📄 License

MIT
