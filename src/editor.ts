import * as vscode from 'vscode';
import { Scope, GoalType, SCOPE_LABELS, TYPE_LABELS } from './types';
import {
  readCoreGoals, writeCoreGoals, filePathForScope,
  readNormalGoals, writeNormalGoals,
} from './storage';

export class GoalEditorProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'coreGoalEditor';
  private view?: vscode.WebviewView;
  private currentScope: Scope = 'workspace';
  private currentType: GoalType = 'core';

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = this.getHtml();

    view.onDidDispose(() => { this.view = undefined; });

    view.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.command) {
        case 'ready':
          this.postGoals();
          break;
        case 'save':
          await this.saveGoals(msg.goals as string[]);
          break;
        case 'switchScope':
          this.currentScope = msg.scope as Scope;
          this.currentType = msg.type as GoalType;
          this.postGoals();
          break;
      }
    });
  }

  /** 外部调用：切换到指定作用域/类型并聚焦 */
  focusOn(scope: Scope, type: GoalType): void {
    this.currentScope = scope;
    this.currentType = type;
    this.postGoals();
  }

  private postGoals(): void {
    if (!this.view) { return; }
    const goals = this.currentType === 'core'
      ? readCoreGoals(this.currentScope)
      : readNormalGoals();
    try {
      this.view.webview.postMessage({
        command: 'load',
        scope: this.currentScope,
        type: this.currentType,
        goals,
        filePath: this.currentType === 'core' ? filePathForScope(this.currentScope) : undefined,
      });
    } catch {
      // webview 已销毁，忽略
    }
  }

  private async saveGoals(goals: string[]): Promise<void> {
    if (this.currentType === 'core') {
      const fp = filePathForScope(this.currentScope);
      if (!fp) {
        vscode.window.showErrorMessage('无法确定目标文件路径（需要先打开工作区）');
        return;
      }
      writeCoreGoals(fp, goals);
    } else {
      writeNormalGoals(goals);
    }
    vscode.window.showInformationMessage(
      `✅ ${SCOPE_LABELS[this.currentScope]} · ${TYPE_LABELS[this.currentType]} 已保存（${goals.length} 条）`
    );
    // 通知 tree 刷新
    vscode.commands.executeCommand('coreGoal.refresh');
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-font-family); padding: 8px; color: var(--vscode-foreground); }
  .tabs { display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap; }
  .tab { padding: 3px 8px; border: 1px solid var(--vscode-button-secondaryBorder, #555);
         border-radius: 3px; cursor: pointer; font-size: 12px; background: transparent;
         color: var(--vscode-foreground); }
  .tab.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground);
                border-color: var(--vscode-button-background); }
  textarea { width: 100%; min-height: 200px; box-sizing: border-box; resize: vertical;
             background: var(--vscode-input-background); color: var(--vscode-input-foreground);
             border: 1px solid var(--vscode-input-border, #555); border-radius: 4px;
             padding: 8px; font-family: var(--vscode-editor-font-family); font-size: 13px;
             line-height: 1.6; }
  textarea:focus { outline: 1px solid var(--vscode-focusBorder); }
  .hint { font-size: 11px; color: var(--vscode-descriptionForeground); margin: 6px 0; }
  .filepath { font-size: 11px; color: var(--vscode-textLink-foreground); cursor: pointer;
              word-break: break-all; margin: 4px 0; }
  button { margin-top: 8px; padding: 5px 16px; background: var(--vscode-button-background);
           color: var(--vscode-button-foreground); border: none; border-radius: 4px;
           cursor: pointer; font-size: 13px; }
  button:hover { background: var(--vscode-button-hoverBackground); }
  .count { font-size: 11px; color: var(--vscode-descriptionForeground); float: right; }
</style>
</head>
<body>
  <div class="tabs" id="scopeTabs">
    <button class="tab" data-scope="global" data-type="core">🌐 全局</button>
    <button class="tab active" data-scope="workspace" data-type="core">📁 工作区</button>
    <button class="tab" data-scope="window" data-type="core">🪟 窗口</button>
    <button class="tab" data-scope="workspace" data-type="normal">💡 一般</button>
  </div>
  <div class="hint" id="hint"></div>
  <div class="filepath" id="filepath"></div>
  <span class="count" id="count"></span>
  <textarea id="editor" placeholder="每行一条目标，空行自动忽略..."></textarea>
  <button id="saveBtn">💾 保存</button>

<script>
  const vscode = acquireVsCodeApi();
  const editor = document.getElementById('editor');
  const hint = document.getElementById('hint');
  const filepath = document.getElementById('filepath');
  const count = document.getElementById('count');
  const tabs = document.querySelectorAll('.tab');

  const HINTS = {
    'global-core': '全局核心目标：所有项目、每次会话都注入 system prompt。',
    'workspace-core': '工作区核心目标：当前项目每次会话注入 system prompt。',
    'window-core': '窗口目标（.local.md）：仅本机生效，不提交 git。',
    'workspace-normal': '一般目标：不每轮注入，AI 通过 /goals 按需查看。',
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      vscode.postMessage({
        command: 'switchScope',
        scope: tab.dataset.scope,
        type: tab.dataset.type,
      });
    });
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const goals = editor.value.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
    vscode.postMessage({ command: 'save', goals });
  });

  window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.command === 'load') {
      editor.value = msg.goals.join('\\n');
      const key = msg.scope + '-' + msg.type;
      hint.textContent = HINTS[key] || '';
      filepath.textContent = msg.filePath || '';
      updateCount();
      // 同步 tab 高亮
      tabs.forEach(t => {
        t.classList.toggle('active',
          t.dataset.scope === msg.scope && t.dataset.type === msg.type);
      });
    }
  });

  function updateCount() {
    const n = editor.value.split('\\n').filter(l => l.trim()).length;
    count.textContent = n + ' 条';
  }
  editor.addEventListener('input', updateCount);

  vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
  }
}
