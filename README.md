# Mental Seal · 思想钢印

> 🔗 [English](#english) · [中文](#中文)

**AI长对话思维偏离终结者** — *The end of AI thought-drift in long conversations.*

🖥️ Supports [Reasonix](https://reasonix.com) · [Hermes](https://github.com/nousresearch/hermes-agent) · VS Code · Cursor

---

## English

> *"The Mental Seal invented by Wallfacer Hines can engrave a belief irreversibly into the brain."* — *The Three-Body Problem II: The Dark Forest*

**Your AI agent drifts.** After dozens of turns, it forgets project goals, breaks architectural conventions, repeats mistakes. You tried three-layer memory. You tried injecting 1000 tokens every turn. **Compact erases it all.**

**Mental Seal exploits the uncompactable zone of the system prompt: it engraves core goals into the cache-stable prefix.** No matter how long the conversation, no matter how ruthless the compression, the seal holds. It is the only architectural solution to long-session thought-drift.

### 🚀 Three ways to use

**Option 1: Chat-based management (Recommended ⭐)**

Works with Reasonix · Hermes. Talk to the AI directly:

| You say | Result |
|---------|--------|
| `show seals` | List all seals |
| `add seal: xxxx` | Add to current project |
| `add global seal: xxxx` | Add globally (all projects) |
| `delete seal 3` | Remove seal #3 |
| `disable seal 2` | Pause (not injected) |
| `enable seal 2` | Reactivate |

**Reasonix install:**
```bash
mkdir -p %APPDATA%/reasonix/skills/mental-seal/
copy install/mental-seal-skill.md %APPDATA%/reasonix/skills/mental-seal/SKILL.md
```

**Hermes install:**
```bash
mkdir -p "%LOCALAPPDATA%/Hermes Agent CN Desktop/data/hermes-home/skills/mental-seal/"
copy install/mental-seal-skill.md "%LOCALAPPDATA%/Hermes Agent CN Desktop/data/hermes-home/skills/mental-seal/SKILL.md
```

Restart the app, then say "show seals" in any project.

**Option 2: VS Code / Cursor Extension**

```bash
code --install-extension mental-seal-0.1.0.vsix
```

🎯 icon in the activity bar → full sidebar with three-level scope management, per-item toggles, drag-and-drop.

**Option 3: Edit files directly**

| Scope | Reasonix | Hermes |
|-------|----------|--------|
| 🌐 Global | `%APPDATA%/reasonix/REASONIX.md` | TBD |
| 📁 Project | `<project>/.reasonix/REASONIX.md` | TBD |

Modify `- ` lines between markers. Save → next session picks it up.

> Hermes system prompt injection differs slightly from Reasonix. For Hermes users, we recommend chat-based management (Option 1) — injection compatibility is handled automatically.

### ✨ The name

| In the novel | In the extension |
|:---|:---|
| Engraves belief into neurons | Engraves goals into system prompt prefix |
| Irreversible, indelible | Survives compact, never lost |
| The sealed one never doubts | The agent never forgets |

### 📐 How it works

Supported tools fold their instruction file into the system prompt's **cache-stable prefix** at session start: compaction-proof, cache-hit-eligible, near-zero token cost. The `<!-- MENTAL-SEAL:START/END -->` markers ensure other content stays untouched.

---

## 中文

> *"面壁者希恩斯发明的思想钢印，能将一个信念不可逆地刻入大脑。"* ——《三体 II · 黑暗森林》

**你的 AI Agent 有"思维偏离症"。** 对话超过几十轮，它就开始跑偏——忘了项目目标、违反架构约定、重复犯同一个错。你试过三层记忆，试过每轮塞 1000 token 提醒：**compact 一压缩，记忆全清零。**

**思想钢印利用 system prompt 的不可压缩区：把核心目标刻进 cache-stable 前缀。** 对话再长、压缩再狠，信念永在。这是目前唯一从架构层面根治长对话思维偏离的方案。

### 🚀 三种用法

**方式一：在对话中直接管理（推荐 ⭐）**

支持 Reasonix · Hermes。直接对 AI 说：

| 你说 | 效果 |
|------|------|
| `显示钢印` | 列出全部钢印 |
| `加钢印：xxxx` | 添加到当前项目 |
| `加全局钢印：xxxx` | 添加到全局（所有项目生效） |
| `删钢印 3` | 删除第 3 条 |
| `停用钢印 2` | 停用（不注入 AI） |
| `启用钢印 2` | 重新激活 |

**Reasonix 安装：**
```bash
mkdir -p %APPDATA%/reasonix/skills/mental-seal/
copy install/mental-seal-skill.md %APPDATA%/reasonix/skills/mental-seal/SKILL.md
```

**Hermes 安装：**
```bash
mkdir -p "%LOCALAPPDATA%/Hermes Agent CN Desktop/data/hermes-home/skills/mental-seal/"
copy install/mental-seal-skill.md "%LOCALAPPDATA%/Hermes Agent CN Desktop/data/hermes-home/skills/mental-seal/SKILL.md
```

重启即可。在任何项目中说「显示钢印」。

**方式二：VS Code / Cursor 侧边栏**

```bash
code --install-extension mental-seal-0.1.0.vsix
```

点击活动栏 🎯 图标，侧边栏可视化管理：三级作用域、逐条勾选、拖拽排序。

**方式三：直接编辑文件**

| 级别 | Reasonix | Hermes |
|------|----------|--------|
| 🌐 全局 | `%APPDATA%/reasonix/REASONIX.md` | 待测试 |
| 📁 项目 | `<项目>/.reasonix/REASONIX.md` | 待测试 |

改 `MENTAL-SEAL:START/END` 之间的 `- ` 行，保存即生效。

> Hermes 的系统注入机制与 Reasonix 略有不同，建议优先用对话方式管理（方式一），注入兼容性无需关心。

### ✨ 命名由来

| 三体中的钢印 | Mental Seal |
|:---|:---|
| 将信念刻入大脑神经元 | 将目标刻入 system prompt 前缀 |
| 不可逆、不可删除 | 不会被 compact 压缩 |
| 受印者永远坚信 | Agent 每次会话都"记得" |

### 📐 原理

支持的工具每次会话启动时，将指令文件折叠进 system prompt 的 **cache-stable 前缀**：不参与 compact、命中 provider 缓存、几乎零 token 成本。`<!-- MENTAL-SEAL:START/END -->` 标记管理区段。

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

---

## 🌐 Community

- [Hermes PR #73201](https://github.com/NousResearch/hermes-agent/pull/73201) — submitted to Hermes official optional-skills
- [Reasonix Issue #7004](https://github.com/esengine/DeepSeek-Reasonix/issues/7004) — project share · [#7005](https://github.com/esengine/DeepSeek-Reasonix/issues/7005) — sidebar feature request
