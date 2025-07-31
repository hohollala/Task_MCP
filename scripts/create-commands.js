#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { homedir } from 'os';

const commandsDir = path.join(homedir(), '.claude', 'commands');

async function createCommands() {
  try {
    // ~/.claude/commands 폴더 생성
    await fs.mkdir(commandsDir, { recursive: true });

    // task-new.md 생성
    const taskNewContent = `# task-new

📱 새 프로젝트 요구사항 생성
앱 개발을 위한 7가지 핵심 질문을 하나씩 물어보며 체계적인 요구사항 문서를 생성합니다.

## 설명
task-new 명령어를 실행하면 아래 질문들이 순차적으로 제시됩니다. 각 질문에 답변하면 다음 질문으로 넘어갑니다.

## 질문 목록
1. **앱의 주요 목적은 무엇인가요?**
   예시: 온라인 쇼핑몰, 할일 관리, 소셜 네트워킹 등

2. **필수 기능은 어떤 것들이 있나요?**
   예시: 사용자 로그인, 데이터 저장, 결제 처리, 알림 등

3. **디자인은 제공되나요, 아니면 제작이 필요하신가요?**
   예시:
   - 이미 디자인 파일(Figma, XD 등)이 있음
   - 간단한 기본 디자인으로 시작
   - 완전 커스텀 디자인 필요

4. **서버(API)는 제공되나요, 아니면 개발을 맡겨주실 건가요?**
   예시:
   - 기존 API 서버 있음 (URL 제공)
   - 새로 개발 필요
   - Firebase, Supabase 등 BaaS 사용

5. **외부 서비스 연동이 필요한가요?**
   예시: 소셜 로그인, 결제 게이트웨이, 지도 API, 푸시 알림 등

6. **iOS, Android 중 어떤 플랫폼이 필요한가요?**
   예시: iOS만, Android만, 둘 다, 웹앱도 포함

7. **원하시는 기술 스택이나 제한사항이 있나요?**
   예시: React Native, Flutter, 네이티브 개발, 특정 라이브러리 사용/금지

## 워크플로우
1. task-new를 실행하면 첫 번째 질문이 제시됩니다.
2. 각 질문에 답변하면 다음 질문이 자동으로 표시됩니다.
3. 모든 질문에 답변하면 docs/requirements.md 파일이 생성됩니다.

## 생성되는 파일
- \`docs/requirements.md\`: 프로젝트 요구사항 요약
- \`docs/designed.md\`: 디자인 가이드
- \`docs/technical_spec.md\`: 기술 사양서

## 다음 단계
모든 질문에 답변하면 task-plan 명령어로 프로젝트 전반의 요구사항을 정리한 docs/requirements.md 파일이 생성됩니다.

💡 팁: 각 질문에 명확하고 구체적으로 답변하면 더 정확한 요구사항 문서가 생성됩니다.`;

    // task-plan.md 생성
    const taskPlanContent = `# task-plan

📋 프로젝트 계획 수립
요구사항을 기반으로 체계적인 프로젝트 계획을 수립합니다.

## 설명
task-plan 명령어는 요구사항 문서를 분석하여 프로젝트의 전체적인 계획을 수립합니다.

## 생성되는 파일
- \`docs/project_task.md\`: 프로젝트 작업 계획

## 다음 단계
계획 수립 후 task-start 명령어로 첫 번째 작업을 시작하세요.`;

    // task-start.md 생성
    const taskStartContent = `# task-start

🚀 작업 시작
프로젝트 계획에 따라 다음 작업을 시작합니다.

## 설명
task-start 명령어는 project_task.md 파일을 읽어서 다음 미완료 작업을 찾아 시작합니다.

## 워크플로우
1. project_task.md에서 다음 미완료 작업 찾기
2. 작업 시작 메시지 출력
3. 작업 상태를 진행중으로 변경

## 다음 단계
작업 완료 후 task-resume 명령어로 다음 작업을 진행하세요.`;

    // task-resume.md 생성
    const taskResumeContent = `# task-resume

📋 작업 재개
이전 작업을 이어서 진행합니다.

## 설명
task-resume 명령어는 현재 진행 상황을 확인하고 다음 작업을 자동으로 시작합니다.

## 워크플로우
1. project_task.md 파일 확인
2. 현재 진행 상황 분석
3. 다음 미완료 작업 찾기
4. 해당 작업 시작

## 다음 단계
작업 완료 후 다시 task-resume을 실행하여 다음 작업을 진행하세요.`;

    // 파일들 생성
    await fs.writeFile(path.join(commandsDir, 'task-new.md'), taskNewContent);
    await fs.writeFile(path.join(commandsDir, 'task-plan.md'), taskPlanContent);
    await fs.writeFile(path.join(commandsDir, 'task-start.md'), taskStartContent);
    await fs.writeFile(path.join(commandsDir, 'task-resume.md'), taskResumeContent);

    console.log('✅ 명령어 파일들이 ~/.claude/commands 폴더에 생성되었습니다.');
    console.log('📁 생성된 파일들:');
    console.log('  - task-new.md');
    console.log('  - task-plan.md');
    console.log('  - task-start.md');
    console.log('  - task-resume.md');

  } catch (error) {
    console.error('❌ 명령어 파일 생성 실패:', error);
    process.exit(1);
  }
}

createCommands(); 