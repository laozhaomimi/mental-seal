export type Scope = 'global' | 'workspace' | 'window';
export type GoalType = 'core' | 'normal';

export interface GoalData {
  core: string[];
  normal: string[];
}

export interface GoalItem {
  scope: Scope;
  type: GoalType;
  text: string;
  index: number;
}

export const SCOPE_LABELS: Record<Scope, string> = {
  global: '🌐 全局目标',
  workspace: '📁 工作区目标',
  window: '🪟 窗口目标',
};

export const TYPE_LABELS: Record<GoalType, string> = {
  core: '🎯 核心目标（每次注入）',
  normal: '💡 一般目标（按需调用）',
};
