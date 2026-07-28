# Mental Seal · 思想钢印

**长对话思维偏离终结者** —— 将核心目标刻入 system prompt 不可压缩区，三层记忆做不到的事，钢印一次搞定。

> *"面壁者希恩斯发明的思想钢印，能将一个信念不可逆地刻入大脑。"*
> *——《三体 II · 黑暗森林》*

**你的 AI Agent 有"思维偏离症"。** 对话超过几十轮，它就开始跑偏——忘了项目目标、违反架构约定、重复犯同一个错。你试过三层记忆（短期/长期/项目），试过每轮塞 1000 token 提醒，全都没用：**compact 一压缩，记忆全清零。**

这不是记忆问题，是**架构问题**。对话内容会被压缩，但 **system prompt 前缀永远不会**。

**思想钢印利用这个不可压缩区：把核心目标刻进 system prompt 的 cache-stable 前缀。** 就像钢印刻入神经元——对话再长、压缩再狠、上下文窗口再满，信念永在。

---

## 🚀 三种用法（任选其一）

### 方式一：Reasonix 对话管理（推荐 ⭐）

直接在 Reasonix 对话框里用自然语言操作，无需额外工具：

```
显示钢印           → 列出全部
加钢印：xxxx       → 添加到当前项目
加全局钢印：xxxx   → 添加到全局（所有项目生效）
删钢印 3           → 删除第 3 条
停用钢印 2         → 临时停用（不注入 AI）
启用钢印 2         → 重新激活
```

**安装（30 秒）**：把 `install/mental-seal-skill.md` 复制到 Reasonix 全局 skills 目录：

```bash
mkdir -p %APPDATA%/reasonix/skills/mental-seal/
copy install\mental-seal-skill.md %APPDATA%\reasonix\skills\mental-seal\SKILL.md
```

重启 Reasonix，在任何项目说「显示钢印」即可。

### 方式二：VS Code / Cursor 侧边栏

```bash
code --install-extension mental-seal-0.1.0.vsix
```

打开后活动栏出现 🎯 图标，侧边栏可视化管理：
- 🌐 全局 / 📁 工作区 / 🪟 窗口 三级作用域
- ☑ 逐条勾选启用/停用
- ➕ 添加 / 🗑 删除 / 🔼🔽 排序

### 方式三：直接编辑文件

| 级别 | 文件 | 说明 |
|------|------|------|
| 🌐 全局 | `%APPDATA%/reasonix/REASONIX.md` | 所有项目 |
| 📁 项目 | `<项目>/.reasonix/REASONIX.md` | 当前项目 |

改 `MENTAL-SEAL:START/END` 之间的 `- ` 行，保存即生效。

---

## ✨ 为什么叫思想钢印？

| 三体中的钢印 | Mental Seal |
|:---:|:---:|
| 将信念刻入大脑神经元 | 将目标刻入 system prompt 前缀 |
| 不可逆、不可删除 | 不会被 compact 压缩、不会随对话丢失 |
| 受印者永远坚信 | Agent 每次会话启动都"记得"核心目标 |

---

## 📐 原理

Reasonix 在每次会话启动时，将 `REASONIX.md` 的内容折叠进 **system prompt 的 cache-stable 前缀**：

- ✅ 每轮都在，不随对话增长而稀释
- ✅ 不参与 compact 压缩
- ✅ 命中 provider 缓存，几乎零额外 token 成本

使用 `<!-- MENTAL-SEAL:START/END -->` 标记管理区段，**不破坏你在同一文件中的其他内容**。

---

## 🔧 开发

```bash
npm install
npm run compile   # 编译
npm run watch     # 监听模式
npm run package   # 打包 VSIX
```

## 📄 License

MIT
