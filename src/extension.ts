import * as vscode from 'vscode';
import { GoalTreeProvider, GoalNode, ScopeNode, TypeNode } from './tree';
import { GoalEditorProvider } from './editor';
import { Scope, GoalType } from './types';
import {
  readCoreGoals, writeCoreGoals, filePathForScope,
  readNormalGoals, writeNormalGoals,
} from './storage';

export function activate(context: vscode.ExtensionContext): void {
  const treeProvider = new GoalTreeProvider();
  const editorProvider = new GoalEditorProvider(context.extensionUri);

  // 注册 TreeView
  const treeView = vscode.window.createTreeView('coreGoalView', {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  // 注册 Webview 编辑器面板
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(GoalEditorProvider.viewType, editorProvider)
  );

  // 刷新
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.refresh', () => treeProvider.refresh())
  );

  // 添加核心目标
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.addCore', async () => {
      const scope = await pickScope('选择核心目标的作用域');
      if (!scope) { return; }
      const text = await vscode.window.showInputBox({
        prompt: '输入核心目标（每次会话自动注入 AI 上下文）',
        placeHolder: '例如：本项目是竞彩数据分析系统，所有改动必须保持数据库兼容',
      });
      if (!text?.trim()) { return; }
      const goals = readCoreGoals(scope);
      goals.push(text.trim());
      const fp = filePathForScope(scope);
      if (!fp) { vscode.window.showErrorMessage('无法确定文件路径'); return; }
      writeCoreGoals(fp, goals);
      treeProvider.refresh();
      editorProvider.focusOn(scope, 'core');
      vscode.window.showInformationMessage(`✅ 已添加核心目标（${scope}）`);
    })
  );

  // 添加一般目标
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.addNormal', async () => {
      const text = await vscode.window.showInputBox({
        prompt: '输入一般目标（AI 通过 /goals 按需查看，不每轮注入）',
        placeHolder: '例如：后续考虑加入赔率异常预警功能',
      });
      if (!text?.trim()) { return; }
      const goals = readNormalGoals();
      goals.push(text.trim());
      writeNormalGoals(goals);
      treeProvider.refresh();
      editorProvider.focusOn('workspace', 'normal');
      vscode.window.showInformationMessage('✅ 已添加一般目标');
    })
  );

  // 编辑（从 tree 节点触发）
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.edit', (node: GoalNode) => {
      if (node instanceof GoalNode) {
        editorProvider.focusOn(node.scope, node.type);
      }
    })
  );

  // 删除
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.delete', async (node: GoalNode) => {
      if (!(node instanceof GoalNode)) { return; }
      const confirm = await vscode.window.showWarningMessage(
        `确认删除？\n"${node.text}"`,
        { modal: true },
        '删除'
      );
      if (confirm !== '删除') { return; }

      if (node.type === 'core') {
        const goals = readCoreGoals(node.scope);
        goals.splice(node.index, 1);
        const fp = filePathForScope(node.scope);
        if (fp) { writeCoreGoals(fp, goals); }
      } else {
        const goals = readNormalGoals();
        goals.splice(node.index, 1);
        writeNormalGoals(goals);
      }
      treeProvider.refresh();
      vscode.window.showInformationMessage('🗑️ 已删除');
    })
  );

  // 上移
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.moveUp', (node: GoalNode) => {
      if (!(node instanceof GoalNode) || node.index === 0) { return; }
      moveGoal(node.scope, node.type, node.index, node.index - 1);
      treeProvider.refresh();
    })
  );

  // 下移
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.moveDown', (node: GoalNode) => {
      if (!(node instanceof GoalNode)) { return; }
      const goals = node.type === 'core' ? readCoreGoals(node.scope) : readNormalGoals();
      if (node.index >= goals.length - 1) { return; }
      moveGoal(node.scope, node.type, node.index, node.index + 1);
      treeProvider.refresh();
    })
  );

  // 打开目标文件
  context.subscriptions.push(
    vscode.commands.registerCommand('coreGoal.openFile', async (node: ScopeNode) => {
      if (!(node instanceof ScopeNode)) { return; }
      const fp = filePathForScope(node.scope);
      if (!fp) { return; }
      try {
        const doc = await vscode.workspace.openTextDocument(fp);
        await vscode.window.showTextDocument(doc);
      } catch {
        vscode.window.showInformationMessage(`文件尚不存在：${fp}（添加目标后自动创建）`);
      }
    })
  );

  // 状态栏：显示当前生效的核心目标数量
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = 'coreGoal.refresh';
  context.subscriptions.push(statusBar);
  updateStatusBar(statusBar);

  // 文件变化时自动刷新
  const watcher = vscode.workspace.createFileSystemWatcher('**/.reasonix/REASONIX*.md');
  watcher.onDidChange(() => { treeProvider.refresh(); updateStatusBar(statusBar); });
  watcher.onDidCreate(() => { treeProvider.refresh(); updateStatusBar(statusBar); });
  watcher.onDidDelete(() => { treeProvider.refresh(); updateStatusBar(statusBar); });
  context.subscriptions.push(watcher, treeView);

  function updateStatusBar(bar: vscode.StatusBarItem): void {
    const ws = readCoreGoals('workspace');
    const win = readCoreGoals('window');
    const total = ws.length + win.length;
    bar.text = `$(target) 核心目标: ${total}`;
    bar.tooltip = total > 0
      ? `工作区 ${ws.length} 条 + 窗口 ${win.length} 条核心目标已注入`
      : '点击刷新';
    bar.show();
  }
}

async function pickScope(prompt: string): Promise<Scope | undefined> {
  const items: { label: string; scope: Scope }[] = [
    { label: '📁 工作区（当前项目）', scope: 'workspace' },
    { label: '🪟 窗口（仅本机，不提交 git）', scope: 'window' },
    { label: '🌐 全局（所有项目）', scope: 'global' },
  ];
  const picked = await vscode.window.showQuickPick(items, { placeHolder: prompt });
  return picked?.scope;
}

function moveGoal(scope: Scope, type: GoalType, from: number, to: number): void {
  if (type === 'core') {
    const goals = readCoreGoals(scope);
    const [item] = goals.splice(from, 1);
    goals.splice(to, 0, item);
    const fp = filePathForScope(scope);
    if (fp) { writeCoreGoals(fp, goals); }
  } else {
    const goals = readNormalGoals();
    const [item] = goals.splice(from, 1);
    goals.splice(to, 0, item);
    writeNormalGoals(goals);
  }
}

export function deactivate(): void {}
