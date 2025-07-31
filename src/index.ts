#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const __filename = import.meta.url;
const __dirname = path.dirname(__filename);

// 상수 정의
const DOCS_DIR = 'docs';
const STATE_FILE = path.join(DOCS_DIR, '.task_new_state.json');

interface TaskState {
  questions: Array<{
    key: string;
    question: string;
    example: string;
  }>;
  current_question: number;
  answers: Record<string, string>;
}

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
        description: '새 프로젝트 요구사항 생성 - 7가지 핵심 질문을 통한 체계적 요구사항 수집',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-new-answer',
        description: '요구사항 질문에 대한 답변 처리',
        inputSchema: {
          type: 'object',
          properties: {
            answer: {
              type: 'string',
              description: '사용자의 답변',
            },
          },
          required: ['answer'],
        },
      },
      {
        name: 'task-plan',
        description: '프로젝트 계획 수립 및 작업 구조화',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-start',
        description: '작업 시작 및 진행 관리',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-complete',
        description: '현재 작업 완료 처리',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-resume',
        description: '기존 작업 재개',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-status',
        description: '프로젝트 진행 상황 확인',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'task-clean',
        description: '프로젝트 파일들 삭제 및 초기화',
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
    
    case 'task-new-answer':
      const answer = args?.answer;
      if (typeof answer !== 'string') {
        throw new Error('answer parameter must be a string');
      }
      return await taskNewAnswer(answer);
    
    case 'task-plan':
      return await taskPlan();
    
    case 'task-start':
      return await taskStart();
    
    case 'task-complete':
      return await taskComplete();
    
    case 'task-resume':
      return await taskResume();
    
    case 'task-status':
      return await taskStatus();
    
    case 'task-clean':
      return await taskClean();
    
    default:
      throw new Error(`알 수 없는 도구: ${name}`);
  }
});

// task-new 구현
async function taskNew(): Promise<{ content: Array<{ type: string; text: string }> }> {
  ensureDocsDir();
  
  const questions = [
    {
      key: "purpose",
      question: "앱의 목적과 해결하고자 하는 문제는 무엇인가요?",
      example: "예시: '소상공인들이 재고를 쉽게 관리하고 매출을 추적할 수 있는 앱을 만들어 수작업으로 인한 실수를 줄이고 효율성을 높이고 싶습니다.'"
    },
    {
      key: "features",
      question: "꼭 필요한 핵심 기능들을 나열해주세요.",
      example: "예시: '1. 상품 등록 및 수정 2. 실시간 재고 확인 3. 매출 통계 대시보드 4. 알림 기능 5. 데이터 백업'"
    },
    {
      key: "design",
      question: "디자인 요구사항이나 UI/UX에 대한 선호사항이 있나요?",
      example: "예시: '심플하고 직관적인 디자인을 원합니다. 중장년층 사용자도 쉽게 사용할 수 있도록 큰 버튼과 명확한 메뉴 구조가 필요합니다.'"
    },
    {
      key: "server",
      question: "서버나 API 구조에 대한 요구사항이 있나요?",
      example: "예시: 'REST API를 사용하여 실시간 동기화가 가능해야 하고, 다중 사용자 접근을 지원해야 합니다. 클라우드 기반 데이터베이스 사용을 원합니다.'"
    },
    {
      key: "external_services",
      question: "연동해야 할 외부 서비스나 API가 있나요?",
      example: "예시: '결제는 토스페이먼츠, 알림은 Firebase, 위치 기반 서비스는 카카오맵 API를 사용하고 싶습니다.'"
    },
    {
      key: "platform",
      question: "어떤 플랫폼을 지원해야 하나요?",
      example: "예시: 'iOS와 Android 앱, 그리고 관리자용 웹 대시보드가 필요합니다. 반응형 웹도 고려하고 있습니다.'"
    },
    {
      key: "tech_stack",
      question: "선호하는 기술 스택이나 제약사항이 있나요?",
      example: "예시: 'React Native로 앱 개발, Node.js + Express로 백엔드, MongoDB 데이터베이스를 사용하고 싶습니다. AWS 인프라를 선호합니다.'"
    }
  ];

  const state: TaskState = {
    questions,
    current_question: 0,
    answers: {}
  };

  await saveToFile(STATE_FILE, JSON.stringify(state, null, 2));

  const currentQ = questions[0];
  return {
    content: [{
      type: 'text',
      text: `📱 새 프로젝트 요구사항 생성 (1/7)

**질문 1**: ${currentQ.question}

${currentQ.example}

답변을 입력해주세요.`
    }]
  };
}

// task-new-answer 구현
async function taskNewAnswer(answer: string): Promise<{ content: Array<{ type: string; text: string }> }> {
  if (!checkFileExists(STATE_FILE)) {
    return {
      content: [{
        type: 'text',
        text: '❌ 먼저 task-new를 실행해주세요.'
      }]
    };
  }

  const stateContent = await loadFromFile(STATE_FILE);
  const state: TaskState = JSON.parse(stateContent);

  if (state.current_question < state.questions.length) {
    const currentKey = state.questions[state.current_question].key;
    state.answers[currentKey] = answer;
    state.current_question += 1;

    if (state.current_question < state.questions.length) {
      const currentQ = state.questions[state.current_question];
      await saveToFile(STATE_FILE, JSON.stringify(state, null, 2));

      return {
        content: [{
          type: 'text',
          text: `📱 새 프로젝트 요구사항 생성 (${state.current_question + 1}/7)

**질문 ${state.current_question + 1}**: ${currentQ.question}

${currentQ.example}

답변을 입력해주세요.`
        }]
      };
    } else {
      // 모든 질문 완료 - 문서 생성
      const result = await generateRequirementsodos(state.answers);
      
      // 상태 파일 삭제
      if (checkFileExists(STATE_FILE)) {
        await fs.unlink(STATE_FILE);
      }
      
      return { content: [{ type: 'text', text: result }] };
    }
  }

  return {
    content: [{
      type: 'text',
      text: '❌ 이미 모든 질문에 답변하셨습니다.'
    }]
  };
}

// 요구사항 문서 생성
async function generateRequirementsodos(answers: Record<string, string>): Promise<string> {
  // requirements.md 생성
  const requirementsContent = `# 📱 프로젝트 요구사항 요약

## 명령어
이 시스템을 통해 체계적인 프로젝트 관리를 수행하세요.

### 사용 가능한 명령어
- **task-new**: 새 프로젝트 요구사항 생성
- **task-plan**: 프로젝트 계획 수립  
- **task-start**: 작업 시작 및 진행
- **task-complete**: 작업 완료 처리
- **task-resume**: 작업 재개
- **task-status**: 진행 상황 확인

## 프로젝트 요구사항 상세

### 1. 앱의 목적  
**설명**: 프로젝트의 핵심 가치와 해결하고자 하는 문제
**내용**: ${answers.purpose || '미정'}

### 2. 필수 기능
**설명**: 프로젝트 성공을 위한 핵심 기능들
**내용**: ${answers.features || '미정'}

### 3. 디자인 요구사항  
**설명**: UI/UX 디자인 방향성과 제약사항
**내용**: ${answers.design || '미정'}

### 4. 서버/API 구조
**설명**: 백엔드 시스템 및 API 설계 방향
**내용**: ${answers.server || '미정'}

### 5. 외부 서비스 연동
**설명**: 필요한 외부 API 및 서비스 연동 사항
**내용**: ${answers.external_services || '미정'}

### 6. 플랫폼 지원 범위
**설명**: 지원할 플랫폼 및 디바이스 요구사항  
**내용**: ${answers.platform || '미정'}

### 7. 기술 스택 및 제약사항
**설명**: 사용할 기술 스택과 개발 제한사항
**내용**: ${answers.tech_stack || '미정'}

## 다음 단계
✅ 요구사항 문서 작성 완료
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요.`;

  await saveToFile(path.join(DOCS_DIR, 'requirements.md'), requirementsContent);

  // designed.md와 technical_spec.md도 생성 (간소화된 버전)
  const designedContent = `# 🎨 디자인 가이드

## 디자인 요구사항
${answers.design || '미정'}

## 다음 단계
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요.`;

  const techSpecContent = `# 🔧 기술 사양서

## 기술 스택
${answers.tech_stack || '미정'}

## 서버/API 구조
${answers.server || '미정'}

## 다음 단계
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요.`;

  await saveToFile(path.join(DOCS_DIR, 'designed.md'), designedContent);
  await saveToFile(path.join(DOCS_DIR, 'technical_spec.md'), techSpecContent);

  return `✅ 요구사항 문서가 성공적으로 생성되었습니다!

📁 생성된 파일들:
- docs/requirements.md: 프로젝트 요구사항 요약
- docs/designed.md: 디자인 가이드
- docs/technical_spec.md: 기술 사양서

🚀 다음 단계: task-plan 명령어를 실행하여 프로젝트 계획을 수립하세요.`;
}

// 다른 함수들은 간소화된 버전으로 구현
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

async function taskStart(): Promise<{ content: Array<{ type: string; text: string }> }> {
  if (!checkFileExists(path.join(DOCS_DIR, 'project_task.md'))) {
    return {
      content: [{
        type: 'text',
        text: '❌ 작업 파일이 없습니다. 먼저 task-plan으로 계획을 수립하세요.'
      }]
    };
  }

  return {
    content: [{
      type: 'text',
      text: '🚀 1.1. 개발 환경 설정 시작\n\n작업을 완료하면 task-complete를 실행하세요.'
    }]
  };
}

async function taskComplete(): Promise<{ content: Array<{ type: string; text: string }> }> {
  return {
    content: [{
      type: 'text',
      text: '✅ 1.1. 개발 환경 설정 완료\n\n🚀 다음 작업을 시작하려면 task-start를 실행하세요.'
    }]
  };
}

async function taskResume(): Promise<{ content: Array<{ type: string; text: string }> }> {
  return {
    content: [{
      type: 'text',
      text: '🚀 작업을 재개합니다.\n\ntask-start를 실행하여 다음 작업을 시작하세요.'
    }]
  };
}

async function taskStatus(): Promise<{ content: Array<{ type: string; text: string }> }> {
  return {
    content: [{
      type: 'text',
      text: '📊 프로젝트 진행 상황\n\n🎯 전체 진행률: 0% (0/10)\n⏸️ 진행중인 작업 없음'
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