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

### 🛠️ 설치 방법

1. **MCP 서버 파일 위치 확인**
   ```
   /Users/smith/MCPProjects/Task/mcp-task-manager/mcp_task_manager.py
   ```

2. **Claude Desktop 설정**
   - Claude Desktop 설정 파일 경로: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - 아래 내용으로 설정 파일 생성 또는 업데이트:
   
   ```json
   {
     "mcpServers": {
       "task-manager": {
         "command": "python3",
         "args": [
           "/Users/smith/MCPProjects/Task/mcp-task-manager/mcp_task_manager.py"
         ],
         "env": {}
       }
     }
   }
   ```

3. **Claude Desktop 재시작**
   - 설정 변경 후 Claude Desktop을 완전히 종료하고 다시 시작

### 📱 사용 방법

1. **새 프로젝트 시작**
   - Claude에서 "task-new" tool 실행
   - 7가지 질문에 순차적으로 답변
   - "task-new-answer" tool로 각 질문에 답변

2. **프로젝트 계획 수립**
   - "task-plan" tool 실행하여 작업 계획 생성
   - 5단계 사고 프로세스 기반 계획 수립

3. **작업 진행**
   - "task-start": 다음 작업 시작 (디자인 작업 시 자동 가이드 생성)
   - "task-complete": 현재 작업 완료 처리
   - "task-resume": 기존 작업 재개
   - "task-status": 프로젝트 진행 상황 확인

### 📁 생성되는 파일 구조

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

### 🔧 문제 해결

- MCP 서버가 인식되지 않는 경우: Claude Desktop 완전 재시작
- Python 경로 오류: `which python3` 명령으로 정확한 경로 확인
- 권한 오류: 파일 실행 권한 확인 (`chmod +x mcp_task_manager.py`)

### ✅ 작업 상태 표시

- `[ ]` **대기중**: 아직 시작하지 않은 작업
- `[-]` **진행중**: 현재 작업 중인 작업  
- `[x]` **완료**: 완료된 작업

### 🎯 워크플로우

1. **`task-new`** → 7가지 질문 기반 요구사항 수집
2. **`task-plan`** → 5단계 분석 기반 작업 계획 수립
3. **`task-start`** → 작업 시작 (자동 디자인 가이드 생성)
4. **`task-complete`** → 작업 완료 및 상태 업데이트
5. 3-4 반복 또는 **`task-resume`**로 재개
6. **`task-status`** → 언제든 진행 상황 확인

### 🌟 주요 특징

- **Sample 스타일 문서**: 원본 task.md/new.md 스타일을 참고한 상세한 문서 생성
- **5단계 분석 프로세스**: 체계적인 사고 과정 적용
- **자동 디자인 가이드**: UI/UX 작업 시 상세한 디자인 시스템 자동 생성
- **진행 상황 추적**: 실시간 작업 상태 관리 (`[ ]`, `[-]`, `[x]`)
- **하이픈 명령어**: `task-new`, `task-plan` 등 직관적인 명령어 형태