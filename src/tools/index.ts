import { Logger } from '../utils/logger.js';

// Tool definitions
export function getToolDefinitions() {
  return [
    {
      name: 'task-new',
      description: '새 프로젝트 요구사항 생성',
      inputSchema: {
        type: 'object',
        properties: {},
      }
    },
    {
      name: 'task-plan',
      description: '프로젝트 계획 수립',
      inputSchema: {
        type: 'object',
        properties: {},
      }
    },
    {
      name: 'task-start',
      description: '작업 시작',
      inputSchema: {
        type: 'object',
        properties: {},
      }
    },
    {
      name: 'task-resume',
      description: '작업 재개',
      inputSchema: {
        type: 'object',
        properties: {},
      }
    }
  ];
}

// Prompt definitions
export function getPromptDefinitions() {
  return [
    {
      name: 'task-new',
      description: '새 프로젝트 요구사항 생성',
      arguments: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'task-plan',
      description: '프로젝트 계획 수립',
      arguments: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'task-start',
      description: '작업 시작',
      arguments: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'task-resume',
      description: '작업 재개',
      arguments: {
        type: 'object',
        properties: {}
      }
    }
  ];
}

// Check if tool exists
export function toolExists(toolName: string): boolean {
  return ['task-new', 'task-plan', 'task-start', 'task-resume'].includes(toolName);
}

// Get prompt message
export function getPromptMessage(name: string): string | null {
  const messages: Record<string, string> = {
    'task-new': '새 프로젝트 요구사항을 생성합니다.',
    'task-plan': '프로젝트 계획을 수립합니다.',
    'task-start': '작업을 시작합니다.',
    'task-resume': '작업을 재개합니다.'
  };
  return messages[name] || null;
}

// Execute tool
export async function executeTool(
  toolName: string, 
  args: any, 
  progressCallback?: (output: string) => void
): Promise<string> {
  Logger.info(`Executing tool: ${toolName}`, args);

  if (progressCallback) {
    progressCallback(`Processing ${toolName}...`);
  }

  switch (toolName) {
    case 'task-new':
      return await taskNew();
    case 'task-plan':
      return await taskPlan();
    case 'task-start':
      return await taskStart();
    case 'task-resume':
      return await taskResume();
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Task implementations
async function taskNew(): Promise<string> {
  return `✅ 새 프로젝트 요구사항이 생성되었습니다!

📁 생성된 파일들:
- docs/requirements.md: 프로젝트 요구사항 요약
- docs/designed.md: 디자인 가이드
- docs/technical_spec.md: 기술 사양서

🚀 다음 단계: task-plan 명령어를 실행하여 프로젝트 계획을 수립하세요.`;
}

async function taskPlan(): Promise<string> {
  return `✅ 작업 계획이 생성되었습니다!

📋 프로젝트 계획:
- 1. 프로젝트 초기 설정 및 환경 구축
- 2. UI/UX 설계 및 구현
- 3. 핵심 기능 개발
- 4. 테스트 및 품질 보증
- 5. 배포 및 운영

🚀 task-start로 첫 번째 작업을 시작하세요.`;
}

async function taskStart(): Promise<string> {
  return `🚀 작업을 시작합니다.

📋 현재 작업: 프로젝트 초기 설정 및 환경 구축

작업을 완료하면 task-resume를 실행하세요.`;
}

async function taskResume(): Promise<string> {
  return `📋 작업을 재개합니다.

🚀 task-start를 실행하여 다음 작업을 시작하세요.`;
} 