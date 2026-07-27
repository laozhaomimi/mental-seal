import * as vscode from 'vscode';
import { GoalData, Scope, GoalType, SCOPE_LABELS, TYPE_LABELS } from './types';
import { readGoalData, filePathForScope } from './storage';

type TreeNode = ScopeNode | TypeNode | GoalNode;

class ScopeNode extends vscode.TreeItem {
  constructor(public readonly scope: Scope) {
    super(SCOPE_LABELS[scope], vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = 'scope';
    this.iconPath = new vscode.ThemeIcon(
      scope === 'global' ? 'globe' : scope === 'workspace' ? 'folder' : 'window'
    );
    this.tooltip = filePathForScope(scope) || '';
  }
}

class TypeNode extends vscode.TreeItem {
  constructor(public readonly scope: Scope, public readonly type: GoalType, count: number) {
    super(TYPE_LABELS[type], vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = 'type';
    this.description = `${count} 条`;
    this.iconPath = new vscode.ThemeIcon(type === 'core' ? 'target' : 'lightbulb');
  }
}

class GoalNode extends vscode.TreeItem {
  constructor(
    public readonly scope: Scope,
    public readonly type: GoalType,
    public readonly text: string,
    public readonly index: number
  ) {
    super(text, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'goal';
    this.iconPath = new vscode.ThemeIcon(type === 'core' ? 'circle-filled' : 'circle-outline');
    this.tooltip = `[${SCOPE_LABELS[scope]}] ${text}`;
  }
}

export class GoalTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (!element) {
      // 根：三个作用域
      return [new ScopeNode('global'), new ScopeNode('workspace'), new ScopeNode('window')];
    }

    if (element instanceof ScopeNode) {
      const data = readGoalData(element.scope);
      const nodes: TreeNode[] = [
        new TypeNode(element.scope, 'core', data.core.length),
      ];
      // 一般目标只在工作区级别显示
      if (element.scope === 'workspace') {
        nodes.push(new TypeNode(element.scope, 'normal', data.normal.length));
      }
      return nodes;
    }

    if (element instanceof TypeNode) {
      const data = readGoalData(element.scope);
      const list = element.type === 'core' ? data.core : data.normal;
      return list.map((text, i) => new GoalNode(element.scope, element.type, text, i));
    }

    return [];
  }
}

export { ScopeNode, TypeNode, GoalNode, TreeNode };
