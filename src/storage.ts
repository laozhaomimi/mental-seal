import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GoalData, Scope } from './types';

const MARKER_START = '<!-- MENTAL-SEAL:START -->';
const MARKER_END = '<!-- MENTAL-SEAL:END -->';
const MANAGED_HEADER = '## 🎯 核心目标（由 Mental Seal · 思想钢印 管理）';

/** 全局目标文件：reasonix home 下的 REASONIX.md */
export function globalFilePath(): string {
  const appdata = process.env.APPDATA || path.join(os.homedir(), '.config');
  return path.join(appdata, 'reasonix', 'REASONIX.md');
}

/** 工作区目标文件：<workspace>/.reasonix/REASONIX.md */
export function workspaceFilePath(): string | undefined {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) { return undefined; }
  return path.join(ws.uri.fsPath, '.reasonix', 'REASONIX.md');
}

/** 窗口目标文件：<workspace>/.reasonix/REASONIX.local.md（本地，不提交 git） */
export function windowFilePath(): string | undefined {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) { return undefined; }
  return path.join(ws.uri.fsPath, '.reasonix', 'REASONIX.local.md');
}

/** 一般目标存储：<workspace>/.reasonix/goals.json */
export function goalsJsonPath(): string | undefined {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) { return undefined; }
  return path.join(ws.uri.fsPath, '.reasonix', 'goals.json');
}

/** 一般目标生成的 skill 文件 */
export function goalsSkillPath(): string | undefined {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) { return undefined; }
  return path.join(ws.uri.fsPath, '.reasonix', 'skills', 'goals', 'SKILL.md');
}

export function filePathForScope(scope: Scope): string | undefined {
  switch (scope) {
    case 'global': return globalFilePath();
    case 'workspace': return workspaceFilePath();
    case 'window': return windowFilePath();
  }
}

function writeFileSafe(filePath: string, content: string): boolean {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`写入失败：${filePath}\n${msg}`);
    return false;
  }
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`创建目录失败：${dir}\n${msg}`);
  }
}

function readFileSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/** 从 markdown 文件中提取被管理区段内的核心目标列表 */
export function extractCoreGoals(content: string): string[] {
  const startIdx = content.indexOf(MARKER_START);
  const endIdx = content.indexOf(MARKER_END);
  if (startIdx === -1 || endIdx === -1) { return []; }

  const section = content.slice(startIdx + MARKER_START.length, endIdx);
  const goals: string[] = [];
  for (const line of section.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      goals.push(trimmed.slice(2).trim());
    }
  }
  return goals;
}

/** 将核心目标列表写回 markdown 文件（保留区段外的用户内容） */
export function writeCoreGoals(filePath: string, goals: string[]): void {
  ensureDir(filePath);
  let content = readFileSafe(filePath);

  const managedBlock = buildManagedBlock(goals);

  const startIdx = content.indexOf(MARKER_START);
  const endIdx = content.indexOf(MARKER_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // 替换已有区段（仅当 END 在 START 之后）
    content = content.slice(0, startIdx) + managedBlock + content.slice(endIdx + MARKER_END.length);
  } else {
    // 追加到文件末尾
    if (content.trim().length > 0 && !content.endsWith('\n')) {
      content += '\n';
    }
    if (content.trim().length > 0) {
      content += '\n';
    }
    content += managedBlock;
  }

  writeFileSafe(filePath, content);
}

function buildManagedBlock(goals: string[]): string {
  const lines = [
    MARKER_START,
    '',
    MANAGED_HEADER,
    '',
    '> 以下目标在每次会话启动时自动注入 AI 的 system prompt，永不被压缩遗忘。',
    '',
  ];
  for (const g of goals) {
    lines.push(`- ${g}`);
  }
  lines.push('');
  lines.push(MARKER_END);
  return lines.join('\n');
}

/** 读取一般目标（goals.json） */
export function readNormalGoals(): string[] {
  const p = goalsJsonPath();
  if (!p) { return []; }
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return Array.isArray(data.normal) ? data.normal.filter((x: unknown) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** 写入一般目标并同步生成 skill 文件 */
export function writeNormalGoals(goals: string[]): void {
  const p = goalsJsonPath();
  if (!p) { return; }
  ensureDir(p);
  if (!writeFileSafe(p, JSON.stringify({ normal: goals }, null, 2))) { return; }
  syncGoalsSkill(goals);
}

/** 生成 /goals skill，让 AI 按需查看一般目标 */
function syncGoalsSkill(goals: string[]): void {
  const p = goalsSkillPath();
  if (!p) { return; }
  ensureDir(p);

  const goalLines = goals.map((g, i) => `${i + 1}. ${g}`).join('\n');
  const skill = `---
name: goals
description: "查看当前工作区的一般目标（非核心、按需参考）。当用户问'目标是什么'或需要回顾项目方向时调用。"
---

# 一般目标（按需参考）

以下是当前工作区的一般目标，非每轮强制注入，按需参考即可：

${goalLines || '（暂无一般目标）'}
`;
  writeFileSafe(p, skill);
}

/** 读取某作用域的核心目标 */
export function readCoreGoals(scope: Scope): string[] {
  const p = filePathForScope(scope);
  if (!p) { return []; }
  return extractCoreGoals(readFileSafe(p));
}

/** 读取完整目标数据 */
export function readGoalData(scope: Scope): GoalData {
  return {
    core: readCoreGoals(scope),
    normal: scope === 'workspace' ? readNormalGoals() : [],
  };
}
