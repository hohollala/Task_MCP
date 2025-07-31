# MCP Task Manager 설치 및 사용 가이드

## 🚀 MCP 작업 관리 시스템

sample/ 폴더의 task.md와 new.md를 기반으로 구현된 MCP(Model Context Protocol) 서버입니다.

### 📋 구현된 Tools (하이픈 형태 명령어)

- **`task-new`**: 7가지 핵심 질문을 통한 체계적 요구사항 수집
- **`task-new-answer`**: 요구사항 질문에 대한 답변 처리  
- **`task-plan`**: 프로젝트 계획 수립 및 작업 구조화
- **`task-start`**: 작업 시작 및 진행 관리
- **`task-complete`**: 현재 작업 완료 처리
- **`task-resume`**: 기존 작업 재개
- **`task-status`**: 프로젝트 진행 상황 확인

## 🛠️ 설치

### 방법 1: 간단한 글로벌 설치

```bash
# 프로젝트 클론
git clone https://github.com/hohollala/Task_MCP.git
cd Task_MCP

# 한 번에 설치 및 설정
npm install && npm run build && npm install -g .

# MCP 서버 등록 (사용자 레벨)
# Windows용:
claude mcp add task-manager -s user -- node dist/index.js
# macOS/Linux용:
claude mcp add task-manager -s user -- node $(pwd)/dist/index.js
```

### 방법 2: 로컬 설치

```bash
# 프로젝트 디렉토리에서
npm install && npm run build

# MCP 서버 등록
claude mcp add task-manager -s user -- node $(pwd)/dist/index.js
```

### 설치 확인

```bash
# MCP 서버 목록 확인
claude mcp list

# task-manager가 ✓ Connected 상태로 표시되면 성공!
```

## 📱 사용 방법

### 🖥️ **Claude Desktop 사용법**

1. **새 프로젝트 시작**
   - 🔨 **Tools** 아이콘 클릭 → **`task-new`** 선택
   - 또는 채팅에서 "task-new 실행해줘" 입력

2. **프로젝트 계획 수립**
   - **`task-plan`** tool 실행하여 작업 계획 생성

3. **작업 진행**
   - **`task-start`**: 다음 작업 시작 (디자인 작업 시 자동 가이드 생성)
   - **`task-complete`**: 현재 작업 완료 처리
   - **`task-resume`**: 기존 작업 재개
   - **`task-status`**: 프로젝트 진행 상황 확인

### 💻 **Claude Code 사용법**

1. **새 프로젝트 시작**
   ```bash
   claude
   > task-new를 실행해줘
   ```

2. **프로젝트 계획 수립**
   ```bash
   > task-plan을 실행해서 작업 계획을 세워줘
   ```

3. **작업 진행**
   ```bash
   > task-start로 다음 작업을 시작해줘
   > task-complete로 현재 작업을 완료해줘  
   > task-resume으로 작업을 재개해줘
   > task-status로 진행 상황을 확인해줘
   ```

4. **터미널 통합 기능**
   - 파일 자동 편집 및 생성
   - Git 커밋 및 푸시 자동화
   - 실시간 코드베이스 분석

## 📁 생성되는 파일 구조

```
프로젝트폴더/
├── docs/
│   ├── requirements.md      # 요구사항 문서
│   ├── designed.md         # 디자인 가이드
│   ├── technical_spec.md   # 기술 사양서
│   ├── project_task.md     # 작업 계획 및 진행상황
│   └── design.md          # 디자인 문서 (필요시)
└── claude.md              # 프로젝트 설명 (별도 생성 필요)
```

## 🔧 문제 해결

### **🚫 MCP 서버가 인식되지 않는 경우**

**Claude Desktop:**
```bash
# 1. Claude Desktop 완전 재시작 (Cmd+Q)
# 2. 설정 파일 경로 확인
echo $HOME/Library/Application\ Support/Claude/claude_desktop_config.json

# 3. Node.js 절대 경로 사용
which node
# 결과를 설정 파일의 "command"에 사용
```

**Claude Code (터미널):**
```bash
# 1. 로컬 설치 방식 (권장)
cd /path/to/your/project
npm install
npm run build
claude mcp add task-manager -s user -- node $(pwd)/dist/index.js

# 2. 글로벌 설치 확인
which task-manager

# 3. 홈 디렉토리에서 글로벌 등록
cd ~
claude mcp add task-manager -- task-manager

# 4. MCP 서버 목록 확인
claude mcp list

# 5. 로컬 설치인 경우 프로젝트별 추가
claude mcp add task-manager -s user -- node /absolute/path/to/dist/index.js
```

### **🚫 Tools가 보이지 않는 경우**

**Claude Desktop:**
1. 🔨 Tools 아이콘이 보이지 않는 경우
2. Claude Desktop 버전 확인 (최신 버전 권장)
3. 설정 파일 JSON 문법 오류 확인

**Claude Code (터미널):**
1. Claude 확장이 최신 버전인지 확인
2. MCP 기능 지원 여부 확인 (확장 설명 참조)
3. VS Code settings.json 문법 오류 확인
4. Developer Console에서 오류 로그 확인

### **로그 확인 방법**

**Claude Desktop (macOS):**
```bash
# Claude Desktop 로그 확인
tail -f ~/Library/Logs/Claude/claude.log
```

**Claude for Code (VS Code):**
```bash
# VS Code Developer Console 열기: Help > Toggle Developer Tools
# 또는 Output 패널: View > Output > Channel: Claude
```

**터미널에서 직접 실행** (디버깅용):
```bash
# 로컬 빌드 후 직접 실행
npm install
npm run build
node dist/index.js

# 또는 글로벌 설치된 경우
task-manager
```

## ✅ 작업 상태 표시

- `[ ]` **대기중**: 아직 시작하지 않은 작업
- `[-]` **진행중**: 현재 작업 중인 작업  
- `[x]` **완료**: 완료된 작업

## 🎯 워크플로우

1. **`task-new`** → 7가지 질문 기반 요구사항 수집
2. **`task-plan`** → 5단계 분석 기반 작업 계획 수립
3. **`task-start`** → 작업 시작 (자동 디자인 가이드 생성)
4. **`task-complete`** → 작업 완료 및 상태 업데이트
5. 3-4 반복 또는 **`task-resume`**로 재개
6. **`task-status`** → 언제든 진행 상황 확인

## 🌟 주요 특징

- **Sample 스타일 문서**: 원본 task.md/new.md 스타일을 참고한 상세한 문서 생성
- **5단계 분석 프로세스**: 체계적인 사고 과정 적용
- **자동 디자인 가이드**: UI/UX 작업 시 상세한 디자인 시스템 자동 생성
- **진행 상황 추적**: 실시간 작업 상태 관리 (`[ ]`, `[-]`, `[x]`)
- **하이픈 명령어**: `task-new`, `task-plan` 등 직관적인 명령어 형태
- **다중 플랫폼 지원**: Claude Desktop과 Claude Code 모두 지원
- **간단한 설치**: NPX 직접 실행으로 한 번에 설치 및 사용 가능