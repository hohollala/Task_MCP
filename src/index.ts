#!/usr/bin/env node

// @ts-ignore
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// @ts-ignore
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
// @ts-ignore
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const __filename = import.meta.url;
const __dirname = path.dirname(__filename);

// 상수 정의
const DOCS_DIR = '~/.claude/commands';

// docs 디렉토리 생성
function ensureDocsDir(): void {
  if (!existsSync(DOCS_DIR)) {
    mkdirSync(DOCS_DIR, { recursive: true });
  }
}

// 파일 읽기
async function loadFromFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

// 파일 저장
async function saveToFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  await fs.writeFile(filePath, content, 'utf-8');
}

// 파일 존재 확인
function checkFileExists(filePath: string): boolean {
  return existsSync(filePath);
}

// MCP 서버 생성
const server = new Server(
  {
    name: 'task-manager',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 도구 목록 반환
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'task-new',
        description: '새 프로젝트 요구사항 생성',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-plan',
        description: '프로젝트 계획 수립',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-start',
        description: '작업 시작',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-resume',
        description: '작업 재개',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// 도구 호출 처리
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'task-new':
      return await taskNew();
    
    case 'task-plan':
      return await taskPlan();
    
    case 'task-start':
      return await taskStart();
    
    case 'task-resume':
      return await taskResume();
    
    default:
      throw new Error(`알 수 없는 도구: ${name}`);
  }
});

// task-new 구현
async function taskNew(): Promise<{ content: Array<{ type: string; text: string }> }> {
  ensureDocsDir();
  
  const requirementsContent = `# 📱 프로젝트 요구사항 요약

## 프로젝트 요구사항 상세

### 1. 앱의 목적  
**설명**: 프로젝트의 핵심 가치와 해결하고자 하는 문제
**내용**: 새로운 프로젝트 개발

### 2. 필수 기능
**설명**: 프로젝트 성공을 위한 핵심 기능들
**내용**: 기본 기능 구현

### 3. 디자인 요구사항  
**설명**: UI/UX 디자인 방향성과 제약사항
**내용**: 사용자 친화적인 인터페이스

### 4. 서버/API 구조
**설명**: 백엔드 시스템 및 API 설계 방향
**내용**: REST API 기반 백엔드

### 5. 외부 서비스 연동
**설명**: 필요한 외부 API 및 서비스 연동 사항
**내용**: 필요시 외부 API 연동

### 6. 플랫폼 지원 범위
**설명**: 지원할 플랫폼 및 디바이스 요구사항  
**내용**: 웹 기반 애플리케이션

### 7. 기술 스택 및 제약사항
**설명**: 사용할 기술 스택과 개발 제한사항
**내용**: 현대적인 웹 기술 스택

## 다음 단계
✅ 요구사항 문서 작성 완료
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요.`;

  await saveToFile(path.join(DOCS_DIR, 'requirements.md'), requirementsContent);

  const designedContent = `# 🎨 디자인 가이드

## 디자인 요구사항
사용자 친화적인 인터페이스

## 다음 단계
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요.`;

  const techSpecContent = `# 🔧 기술 사양서

## 기술 스택
현대적인 웹 기술 스택

## 서버/API 구조
REST API 기반 백엔드

## 다음 단계
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요.`;

  await saveToFile(path.join(DOCS_DIR, 'designed.md'), designedContent);
  await saveToFile(path.join(DOCS_DIR, 'technical_spec.md'), techSpecContent);

  return {
    content: [{
      type: 'text',
      text: `✅ 요구사항 문서가 성공적으로 생성되었습니다!

📁 생성된 파일들:
- docs/requirements.md: 프로젝트 요구사항 요약
- docs/designed.md: 디자인 가이드
- docs/technical_spec.md: 기술 사양서

🚀 다음 단계: task-plan 명령어를 실행하여 프로젝트 계획을 수립하세요.`
    }]
  };
}

// task-plan 구현
async function taskPlan(): Promise<{ content: Array<{ type: string; text: string }> }> {
  ensureDocsDir();
  
  const planContent = `# 프로젝트: 새 프로젝트

[ ] 1. 프로젝트 초기 설정 및 환경 구축
**목표**: 개발 환경 준비 및 기본 구조 설계

- [ ] 1.1. 개발 환경 설정
- [ ] 1.2. 기본 아키텍처 구현

[ ] 2. UI/UX 설계 및 구현
**목표**: 사용자 인터페이스 및 경험 최적화

- [ ] 2.1. UI 컴포넌트 설계
- [ ] 2.2. 사용자 경험 최적화

[ ] 3. 핵심 기능 개발
**목표**: 주요 비즈니스 로직 구현

- [ ] 3.1. 기본 기능 구현
- [ ] 3.2. 고급 기능 구현

[ ] 4. 테스트 및 품질 보증
**목표**: 안정성 및 품질 확보

- [ ] 4.1. 테스트 구현
- [ ] 4.2. 품질 보증

[ ] 5. 배포 및 운영
**목표**: 프로덕션 환경 배포 및 운영 체계 구축

- [ ] 5.1. 배포 준비
- [ ] 5.2. 운영 체계 구축

## 작업 상태 표시
- \`[ ]\` **대기중**: 아직 시작하지 않은 작업
- \`[-]\` **진행중**: 현재 작업 중인 작업  
- \`[x]\` **완료**: 완료된 작업`;

  await saveToFile(path.join(DOCS_DIR, 'project_task.md'), planContent);

  return {
    content: [{
      type: 'text',
      text: '✅ 작업 계획이 생성되었습니다!\n🚀 task-start로 첫 번째 작업을 시작하세요.'
    }]
  };
}

// task-start 구현
async function taskStart(): Promise<{ content: Array<{ type: string; text: string }> }> {
  return {
    content: [{
      type: 'text',
      text: '🚀 작업을 시작합니다.\n\n작업을 완료하면 task-resume를 실행하세요.'
    }]
  };
}

// task-resume 구현
async function taskResume(): Promise<{ content: Array<{ type: string; text: string }> }> {
  return {
    content: [{
      type: 'text',
      text: '📋 작업을 재개합니다.\n\n🚀 task-start를 실행하여 다음 작업을 시작하세요.'
    }]
  };
}

async function taskClean(): Promise<{ content: Array<{ type: string; text: string }> }> {
  const deletedFiles: string[] = [];

  try {
    if (existsSync(DOCS_DIR)) {
      await fs.rm(DOCS_DIR, { recursive: true });
      deletedFiles.push('📁 docs/ 디렉토리');
    }

    if (deletedFiles.length > 0) {
      return {
        content: [{
          type: 'text',
          text: `🧹 프로젝트 초기화 완료!

삭제된 파일:
${deletedFiles.map(file => `✅ ${file}`).join('\n')}

🚀 새 프로젝트를 시작하려면 task-new를 실행하세요.`
        }]
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: '✨ 삭제할 파일이 없습니다. 프로젝트가 이미 깨끗합니다.'
        }]
      };
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ 파일 삭제 실패: ${error}`
      }]
    };
  }
}

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);