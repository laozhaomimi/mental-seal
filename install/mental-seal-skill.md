---
name: mental-seal
description: "管理思想钢印：查看、添加、删除、启用、停用核心目标。用户说'显示钢印/加钢印/删钢印/停用钢印'时调用。"
---

# Mental Seal · 思想钢印 管理技能

## 核心文件

- 全局：`%APPDATA%/reasonix/REASONIX.md`
- 项目级：`<当前工作区>/.reasonix/REASONIX.md`

数据以 JSON 格式存储在 `<当前工作区>/.reasonix/mental-seal-goals.json`：

```json
{
  "global": [{"text": "目标内容", "enabled": true}, ...],
  "project": [{"text": "目标内容", "enabled": false}, ...]
}
```

## 操作指南

### 1. 显示钢印
用户说"显示钢印/查看钢印/钢印列表"时：
- 读取 `mental-seal-goals.json`，如果不存在则创建空文件
- 同时读取 `REASONIX.md`（全局 + 项目级），以文件中的实际内容为准
- 以卡片形式展示：序号 · 启用/停用 · 目标文本 · 所属（全局/项目）

### 2. 添加钢印
用户说"加钢印/添加钢印/新增钢印：xxx"时：
- 默认添加到**项目级**
- 如果明确说"加全局钢印"，则添加到全局
- 追加到 json 文件，默认 enabled: true
- 同步写入 REASONIX.md

### 3. 删除钢印
用户说"删钢印/删除钢印 N"时（N 为序号）：
- 从 json 中删除对应条目
- 同步写入 REASONIX.md

### 4. 启用/停用钢印
用户说"启用钢印 N/停用钢印 N"时：
- 切换对应条目的 enabled 状态
- 停用 = 从 REASONIX.md 中移除
- 启用 = 重新写入 REASONIX.md
- 数据保留在 json 中

### 5. 写入 REASONIX.md
**核心逻辑**：只将 `enabled: true` 的目标写入 REASONIX.md，格式如下：
```markdown
<!-- MENTAL-SEAL:START -->

## 🎯 核心目标（由 Mental Seal · 思想钢印 管理）

> 以下目标在每次会话启动时自动注入 AI 的 system prompt，永不被压缩遗忘。

- 目标1
- 目标2

<!-- MENTAL-SEAL:END -->
```

- 全局目标写入 `%APPDATA%/reasonix/REASONIX.md`
- 项目级目标写入 `<当前工作区>/.reasonix/REASONIX.md`
- 使用 `<!-- MENTAL-SEAL:START/END -->` 标记区段，区段外内容不动

## 示例对话

```
用户：显示钢印
AI：  📋 当前钢印（项目级 · 以往）：
      ☑ 1. 本项目是竞彩足球数据分析系统...
      ☑ 2. 回答必须使用简体中文...
      ☐ 3. 不要擅自删除...（已停用）
      ☑ 4. 每次修改后必须验证...

用户：停用钢印 3
AI：  ⏸️ 已停用：「不要擅自删除或重构已有功能...」
      下次 Reasonix 会话将不再注入此条。

用户：加钢印：本项目使用 Python 3.12，禁止用 3.13 新语法
AI：  ✅ 已添加为第 5 条（项目级）
      📝 已同步到 .reasonix/REASONIX.md
```

## 注意事项
- 默认操作项目级钢印，除非明确说"全局"
- 写入 REASONIX.md 时保留 `MENTAL-SEAL` 标记区段外的用户内容
- 操作后务必用 `git diff` 或直接告知用户变更内容
