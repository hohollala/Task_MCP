#!/usr/bin/env python3
"""
MCP Task Manager Server
프로젝트 작업 관리를 위한 MCP 서버

Tools:
- /task-new: 새 프로젝트 요구사항 생성
- /task-plan: 프로젝트 계획 수립  
- /task-start: 작업 시작 및 진행 관리
- /task-resume: 작업 재개
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from mcp.server.fastmcp import FastMCP

# MCP 서버 초기화
mcp = FastMCP("task-manager")

# 상수 정의
DOCS_DIR = Path("docs")
REQUIRED_FILES = {
    "claude.md": "claude.md 파일이 없습니다. 먼저 /init 명령으로 claude.md파일을 만드세요.",
    "docs/requirements.md": "docs/requirements.md 파일이 없습니다. 먼저 /task-new 명령으로 요구사항을 작성해주세요.",
    "docs/designed.md": "docs/designed.md 파일이 없습니다. 먼저 /task-new 명령으로 요구사항을 작성해주세요.",
    "docs/technical_spec.md": "docs/technical_spec.md 파일이 없습니다. 먼저 /task-new 명령으로 요구사항을 작성해주세요."
}

def ensure_docs_dir():
    """docs 디렉토리가 존재하는지 확인하고 없으면 생성"""
    DOCS_DIR.mkdir(exist_ok=True)

def check_file_exists(file_path: str) -> bool:
    """파일 존재 여부 확인"""
    return Path(file_path).exists()

def save_to_file(file_path: str, content: str) -> None:
    """파일에 내용 저장"""
    Path(file_path).parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def load_from_file(file_path: str) -> str:
    """파일에서 내용 로드"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ""

@mcp.tool(name="task-new")
async def task_new() -> str:
    """새 프로젝트 요구사항 생성 - 7가지 핵심 질문을 통한 체계적 요구사항 수집
    
    Returns:
        str: 첫 번째 질문 또는 완료 메시지
    """
    ensure_docs_dir()
    
    # 진행 상황 확인
    state_file = "docs/.task_new_state.json"
    
    if check_file_exists(state_file):
        with open(state_file, 'r', encoding='utf-8') as f:
            state = json.load(f)
    else:
        state = {
            "current_question": 0,
            "answers": {},
            "questions": [
                {
                    "key": "purpose",
                    "question": "앱의 주요 목적은 무엇인가요?",
                    "example": "예시: 온라인 쇼핑몰, 할일 관리, 소셜 네트워킹 등"
                },
                {
                    "key": "features",
                    "question": "필수 기능은 어떤 것들이 있나요?",
                    "example": "예시: 사용자 로그인, 데이터 저장, 결제 처리, 알림 등"
                },
                {
                    "key": "design",
                    "question": "디자인은 제공되나요, 아니면 제작이 필요하신가요?",
                    "example": "예시:\n- 이미 디자인 파일(Figma, XD 등)이 있음\n- 간단한 기본 디자인으로 시작\n- 완전 커스텀 디자인 필요"
                },
                {
                    "key": "server",
                    "question": "서버(API)는 제공되나요, 아니면 개발을 맡겨주실 건가요?",
                    "example": "예시:\n- 기존 API 서버 있음 (URL 제공)\n- 새로 개발 필요\n- Firebase, Supabase 등 BaaS 사용"
                },
                {
                    "key": "external_services",
                    "question": "외부 서비스 연동이 필요한가요?",
                    "example": "예시: 소셜 로그인, 결제 게이트웨이, 지도 API, 푸시 알림 등"
                },
                {
                    "key": "platform",
                    "question": "iOS, Android 중 어떤 플랫폼이 필요한가요?",
                    "example": "예시: iOS만, Android만, 둘 다, 웹앱도 포함"
                },
                {
                    "key": "tech_stack",
                    "question": "원하시는 기술 스택이나 제한사항이 있나요?",
                    "example": "예시: React Native, Flutter, 네이티브 개발, 특정 라이브러리 사용/금지"
                }
            ]
        }
    
    # 현재 질문 반환
    if state["current_question"] < len(state["questions"]):
        current_q = state["questions"][state["current_question"]]
        
        # 상태 저장
        with open(state_file, 'w', encoding='utf-8') as f:
            json.dump(state, f, ensure_ascii=False, indent=2)
        
        return f"""📱 새 프로젝트 요구사항 생성 ({state["current_question"] + 1}/7)

**질문 {state["current_question"] + 1}**: {current_q["question"]}

{current_q["example"]}

답변을 입력해주세요. 답변 후 다시 /task-new를 실행하여 다음 질문으로 넘어갑니다."""
    
    # 모든 질문 완료 - 문서 생성
    return await _generate_requirements_docs(state["answers"])

async def _generate_requirements_docs(answers: Dict[str, str]) -> str:
    """요구사항 문서들 생성"""
    
    # requirements.md 생성
    requirements_content = f"""# 📱 프로젝트 요구사항 요약

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
**내용**: {answers.get("purpose", "미정")}

### 2. 필수 기능
**설명**: 프로젝트 성공을 위한 핵심 기능들
**내용**: {answers.get("features", "미정")}

### 3. 디자인 요구사항  
**설명**: UI/UX 디자인 방향성과 제약사항
**내용**: {answers.get("design", "미정")}

### 4. 서버/API 구조
**설명**: 백엔드 시스템 및 API 설계 방향
**내용**: {answers.get("server", "미정")}

### 5. 외부 서비스 연동
**설명**: 필요한 외부 API 및 서비스 연동 사항
**내용**: {answers.get("external_services", "미정")}

### 6. 플랫폼 지원 범위
**설명**: 지원할 플랫폼 및 디바이스 요구사항  
**내용**: {answers.get("platform", "미정")}

### 7. 기술 스택 및 제약사항
**설명**: 사용할 기술 스택과 개발 제한사항
**내용**: {answers.get("tech_stack", "미정")}

## 품질 요구사항

### 성능 요구사항
- 응답 시간: 평균 2초 이내
- 동시 사용자: 예상 사용자 수에 따른 확장성
- 가용성: 99.9% 이상 서비스 가용성

### 보안 요구사항  
- 데이터 암호화: 민감 정보 암호화 필수
- 사용자 인증: 안전한 인증 체계 구축
- 접근 제어: 권한 기반 접근 제어

### 호환성 요구사항
- 브라우저 호환성: 주요 브라우저 지원
- 디바이스 호환성: 반응형 웹 또는 앱 지원
- OS 호환성: 플랫폼별 요구사항 준수

## 제약사항 및 가정사항

### 제약사항
- 예산: 프로젝트 예산 범위
- 일정: 개발 완료 목표 일정
- 리소스: 개발팀 규모 및 역량

### 가정사항
- 사용자 환경: 기본 인터넷 환경 보장
- 기술 환경: 최신 기술 스택 활용 가능
- 운영 환경: 클라우드 기반 인프라 활용

## 다음 단계
✅ 요구사항 문서 작성 완료
🚀 **task-plan** 명령어를 실행하여 프로젝트 계획을 수립하세요."""
    
    # designed.md 생성 - sample 스타일로 개선
    designed_content = f"""# 프로젝트: [프로젝트명] 디자인 가이드

## 명령어
이 디자인 가이드는 **task-plan** 단계에서 자동으로 참조되어 일관된 디자인 시스템을 구축합니다.

### 관련 명령어
- **task-start**: 디자인 작업 시작 시 이 가이드 참조
- **task-complete**: 디자인 작업 완료 후 가이드 업데이트

## 5단계 디자인 사고 프로세스

### 1. 사용자 요구사항 분석
- **사용자 페르소나**: 주요 타겟 사용자 정의
- **사용자 여정**: 핵심 사용자 플로우 매핑
- **니즈 분석**: 사용자 목표와 경험 중심 분석
- **문제점 식별**: 기존 솔루션의 한계점 파악

### 2. 디자인 원칙 설계
- **핵심 원칙**: 
  - 일관성: 모든 인터페이스에서 동일한 패턴 적용
  - 직관성: 학습 비용 최소화를 위한 직관적 인터페이스
  - 접근성: WCAG 2.1 AA 수준 준수
  - 효율성: 최소한의 클릭으로 목표 달성
- **브랜드 정체성**: 브랜드 가치를 반영한 시각적 요소
- **감정적 반응**: 사용자가 느껴야 할 감정 정의

### 3. 사용자 흐름 및 상호작용 검증
- **정보 구조**: 콘텐츠 계층 구조 및 네비게이션 설계
- **인터랙션 패턴**: 사용자 행동에 따른 시스템 반응 정의
- **피드백 시스템**: 사용자 행동에 대한 즉각적 피드백 제공
- **에러 처리**: 오류 상황에서의 사용자 가이드 방식

### 4. 디자인 구현 전략
- **컴포넌트 시스템**: 재사용 가능한 UI 컴포넌트 라이브러리
- **프로토타이핑**: 핵심 플로우 프로토타입 제작
- **반응형 전략**: 다양한 디바이스에서의 최적화 방안
- **성능 고려사항**: 로딩 속도 및 애니메이션 최적화

### 5. 디자인 피드백 및 최적화
- **사용성 테스트**: 실제 사용자 테스트를 통한 검증
- **A/B 테스트**: 핵심 요소에 대한 데이터 기반 최적화
- **지속적 개선**: 사용자 피드백 기반 반복 개선
- **확장성**: 향후 기능 추가를 고려한 시스템 설계

## 디자인 룰

### UI/UX 원칙
- **일관성**: 
  - 색상, 폰트, 간격 등 시각적 요소의 일관된 적용
  - 인터랙션 패턴의 일관성 유지
  - 용어 및 라벨링의 일관된 사용
- **접근성**:
  - WCAG 2.1 AA 수준 준수
  - 키보드 내비게이션 지원
  - 스크린 리더 호환성 확보
  - 색상 대비 4.5:1 이상 유지
- **사용자 중심 설계**:
  - 사용자의 멘탈 모델에 맞는 인터페이스
  - 예측 가능한 인터랙션
  - 명확하고 간결한 정보 전달

### 색상 팔레트
- **Primary Colors**:
  - Main: #007BFF (Brand Blue)
  - Light: #66B2FF 
  - Dark: #0056B3
- **Secondary Colors**:
  - Success: #28A745
  - Warning: #FFC107  
  - Error: #DC3545
  - Info: #17A2B8
- **Neutral Colors**:
  - Text Primary: #212529
  - Text Secondary: #6C757D
  - Background: #F8F9FA
  - Border: #DEE2E6
- **Dark Theme**:
  - Background: #1A1A1A
  - Surface: #2D2D2D
  - Text: #FFFFFF

### 타이포그래피
- **Font Family**: 
  - Primary: 'Inter', system-ui, sans-serif
  - Monospace: 'Fira Code', 'Consolas', monospace
- **Font Scale**:
  - H1: 2.5rem (40px) - Bold
  - H2: 2rem (32px) - Bold  
  - H3: 1.5rem (24px) - SemiBold
  - H4: 1.25rem (20px) - SemiBold
  - Body: 1rem (16px) - Regular
  - Small: 0.875rem (14px) - Regular
  - Caption: 0.75rem (12px) - Regular
- **Line Height**: 1.5 (본문), 1.2 (제목)
- **Letter Spacing**: -0.01em (제목), 0 (본문)

### 반응형 설계
- **Breakpoints**:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px  
  - Desktop: 1024px - 1439px
  - Large Desktop: 1440px+
- **Grid System**: 
  - 12 column grid
  - 16px gutter
  - 최대 width: 1200px (desktop)
- **Touch Targets**: 최소 44px × 44px

## 디자인맵

### 컴포넌트 구조
- **Buttons**:
  - Primary: 높은 강조가 필요한 주요 액션
  - Secondary: 보조 액션 또는 취소 기능
  - Tertiary: 링크형 버튼, 최소한의 시각적 무게
  - Size: Small (32px), Medium (40px), Large (48px)
  - Border Radius: 6px
  - States: Default, Hover, Active, Disabled, Loading

- **Input Fields**:
  - Text Input: 기본 텍스트 입력
  - Textarea: 긴 텍스트 입력
  - Select: 드롭다운 선택
  - Checkbox/Radio: 선택 옵션
  - Height: 40px (기본), Padding: 12px 16px
  - Border: 1px solid #DEE2E6
  - Focus: 2px #007BFF shadow

- **Navigation**:
  - Top Navigation: 주요 메뉴 및 사용자 정보
  - Sidebar: 보조 네비게이션 (데스크톱)
  - Bottom Tab Bar: 모바일 주요 네비게이션
  - Breadcrumb: 현재 위치 표시

### 화면 흐름
1. **온보딩 플로우**:
   ```
   [스플래시] → [로그인/회원가입] → [권한 요청] → [튜토리얼] → [메인 화면]
   ```

2. **메인 사용자 플로우**:
   ```
   [메인 대시보드] → [기능 선택] → [작업 수행] → [결과 확인] → [피드백]
   ```

3. **설정 플로우**:
   ```
   [설정 메인] → [카테고리 선택] → [상세 설정] → [변경 사항 저장] → [확인]
   ```

### 와이어프레임 개요

#### 모바일 레이아웃
```
┌─────────────────────┐
│    [Header/Nav]     │
├─────────────────────┤
│                     │
│   [Main Content]    │
│                     │
│                     │
├─────────────────────┤
│   [Bottom Tab Bar]  │
└─────────────────────┘
```

#### 데스크톱 레이아웃  
```
┌─────────────────────────────────────┐
│           [Top Navigation]          │
├──────────┬──────────────────────────┤
│          │                          │
│[Sidebar] │     [Main Content]       │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

## 상태 관리

### 로딩 상태
- **Skeleton Loading**: 콘텐츠 구조를 미리 보여주는 방식
- **Spinner**: 간단한 로딩 인디케이터
- **Progress Bar**: 진행률을 보여주는 로딩

### 에러 상태  
- **Inline Error**: 폼 필드 바로 아래 에러 메시지
- **Toast/Snackbar**: 임시 알림 메시지
- **Error Page**: 전체 화면 에러 상태

### 빈 상태
- **Empty State**: 데이터가 없을 때의 안내
- **Zero State**: 처음 사용자에게 보여주는 가이드

## 애니메이션 가이드

### 트랜지션
- **Duration**: 
  - Micro: 100-200ms (hover, focus)
  - Short: 200-300ms (slide, fade)
  - Medium: 300-500ms (page transition)
- **Easing**: ease-out (가속 후 감속)
- **Properties**: transform, opacity 위주 사용

### 인터랙션 피드백
- **Hover**: 0.1s ease-out
- **Active**: 즉시 반응 (0s)
- **Focus**: 0.2s ease-out outline

이 디자인 가이드는 **task-start** 실행 시 UI/UX 관련 작업에서 자동으로 참조됩니다."""
    
    # technical_spec.md 생성 - sample 스타일로 개선
    technical_spec_content = f"""# 프로젝트: [프로젝트명] 기술 사양서 (Technical Specification)

## 명령어 연동
이 기술 사양서는 **task-plan** 및 **task-start** 단계에서 참조되어 기술적 구현 가이드를 제공합니다.

### 관련 명령어
- **task-plan**: 기술 아키텍처 기반 작업 계획 수립
- **task-start**: 기술 구현 작업 시작 시 참조
- **task-complete**: 기술 구현 완료 후 문서 업데이트

## 1. 아키텍처 개요

### 전체 시스템 구조
- **Frontend**: {answers.get("tech_stack", "모던 웹 프레임워크").split(',')[0] if answers.get("tech_stack") else "React/Next.js"} 기반 클라이언트
- **Backend**: {answers.get("server", "Node.js/Express").split(',')[0] if answers.get("server") else "Node.js/Express"} REST API 서버
- **Database**: {answers.get("tech_stack", "PostgreSQL").split(',')[-1] if '데이터베이스' in answers.get("tech_stack", "") else "PostgreSQL"} (운영), SQLite (개발/테스트)
- **Communication**: HTTPS, WebSocket (실시간 기능 필요시)
- **Infrastructure**: 클라우드 기반 (AWS/GCP/Azure)

### 배포 아키텍처
```
[CDN] → [Load Balancer] → [Web Servers]
                             ↓
[API Gateway] → [Application Servers] → [Database]
                             ↓
[Message Queue] → [Background Workers]
```

### 시스템 요구사항
- **성능**: 응답시간 < 2초, 처리량 > 1000 RPS
- **확장성**: 수평적 확장 지원 (Auto Scaling)
- **가용성**: 99.9% 이상 (연간 8.76시간 이하 다운타임)
- **보안**: SSL/TLS, 데이터 암호화, 접근 제어

## 2. 주요 모듈 및 컴포넌트

### Frontend 모듈
- **Authentication Module**
  - JWT 기반 토큰 인증
  - OAuth 2.0 소셜 로그인 ({answers.get("external_services", "Google, Facebook")})
  - 세션 관리 및 자동 갱신
  
- **UI Component Library**
  - 디자인 시스템 기반 컴포넌트
  - 접근성 (WCAG 2.1 AA) 준수
  - 다크모드 지원
  
- **State Management**
  - 전역 상태 관리 (Redux/Zustand)
  - 로컬 스토리지 동기화
  - 실시간 데이터 동기화

- **Routing & Navigation**
  - SPA 라우팅 (React Router/Next.js Router)
  - 권한 기반 라우트 보호
  - SEO 최적화 (Meta tags, Sitemap)

### Backend 모듈
- **API Layer**
  - RESTful API 설계 (OpenAPI 3.0 문서화)
  - GraphQL (필요시)
  - API 버전 관리 (/v1, /v2)
  - Rate Limiting 및 Throttling

- **Business Logic Layer**
  - 도메인 주도 설계 (DDD) 적용
  - 서비스 계층 패턴
  - 이벤트 기반 아키텍처 (필요시)

- **Data Access Layer**
  - ORM/ODM (Prisma/Mongoose)
  - 데이터베이스 마이그레이션
  - 쿼리 최적화 및 인덱싱

- **Security Layer**
  - 인증/인가 미들웨어
  - 입력값 검증 및 새니타이징
  - CORS, CSRF 보호

## 3. API 명세서

### RESTful API 엔드포인트
| 경로                    | 메서드 | 설명                    | 인증 | 요청 파라미터              | 응답 형식        |
|-----------------------|--------|------------------------|------|---------------------------|-----------------|
| `/api/v1/auth/login`  | POST   | 사용자 로그인           | No   | email, password           | JWT Token, User |
| `/api/v1/auth/logout` | POST   | 로그아웃               | Yes  | -                         | Success Status  |
| `/api/v1/users/me`    | GET    | 현재 사용자 정보 조회    | Yes  | -                         | User Profile    |
| `/api/v1/users/:id`   | PUT    | 사용자 정보 업데이트     | Yes  | user_data                 | Updated User    |

### 응답 표준 형식
```json
{
  "success": true,
  "data": {{}},
  "message": "성공적으로 처리되었습니다",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "v1"
}
```

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": ["이메일 형식이 잘못되었습니다"]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 4. 데이터베이스 설계

### ERD (Entity Relationship Diagram)
```
Users (사용자)
├─ id (PK)
├─ email (UK)
├─ password_hash
├─ profile_info (JSON)
└─ created_at, updated_at

Sessions (세션)
├─ id (PK)
├─ user_id (FK)
├─ token_hash
├─ expires_at
└─ created_at

[추가 테이블들은 요구사항에 따라 정의]
```

### 주요 테이블 설계
- **users**: 사용자 기본 정보 및 인증 데이터
- **user_profiles**: 사용자 프로필 상세 정보
- **sessions**: 로그인 세션 관리
- **audit_logs**: 사용자 활동 로그
- **system_configs**: 시스템 설정 및 환경변수

### 인덱스 전략
- Primary Keys: 모든 테이블
- Unique Constraints: users.email, sessions.token_hash
- Composite Indexes: (user_id, created_at), (status, created_at)
- Full-text Search: 검색 기능 필요 시

### 데이터 마이그레이션
- **Schema Versioning**: 스키마 버전 관리
- **Migration Scripts**: 단계별 마이그레이션 스크립트
- **Rollback Strategy**: 롤백 계획 및 백업 전략

## 5. 성능 및 최적화

### Frontend 최적화
- **Code Splitting**: 라우트 및 컴포넌트 레벨 분할
- **Lazy Loading**: 이미지 및 컴포넌트 지연 로딩
- **Bundle Optimization**: Tree shaking, 압축
- **Caching Strategy**: 
  - Browser Cache (Static Assets)
  - Service Worker (Offline Support)
  - Memory Cache (API Responses)

### Backend 최적화
- **Database Optimization**:
  - Query Optimization (Explain Plans)
  - Connection Pooling
  - Read Replicas (읽기 전용 복제본)
  - Caching (Redis/Memcached)
  
- **Application Performance**:
  - Async/Await 패턴 적용
  - Memory Management
  - CPU 집약적 작업 분리 (Worker Threads)
  
- **Network Optimization**:
  - Response Compression (gzip/brotli)
  - HTTP/2 지원
  - CDN 활용 (정적 자원)

### 모니터링 지표
- **Response Time**: 평균/P95/P99 응답 시간
- **Throughput**: 초당 요청 처리량 (RPS)
- **Error Rate**: 에러율 (4xx, 5xx)
- **Resource Usage**: CPU, Memory, Disk 사용률

## 6. 보안 고려사항

### 인증 및 권한 관리
- **JWT Token**: 
  - Access Token (15분) + Refresh Token (7일)
  - RS256 알고리즘 사용
  - Token Rotation 정책
  
- **Password Security**:
  - bcrypt 해싱 (cost factor: 12)
  - 비밀번호 복잡도 정책
  - 비밀번호 재사용 방지

### 데이터 보호
- **Encryption**:
  - 전송 중 암호화: TLS 1.3
  - 저장 시 암호화: AES-256
  - 개인정보 필드별 암호화
  
- **Data Privacy**:
  - GDPR/CCPA 준수
  - 개인정보 수집 최소화
  - 데이터 보존 정책

### 애플리케이션 보안
- **Input Validation**:
  - 서버사이드 검증 필수
  - SQL Injection 방지
  - XSS 방지 (CSP 헤더)
  
- **API Security**:
  - Rate Limiting (사용자당 100 req/min)
  - CORS 정책 설정
  - API Key 관리 (필요시)

## 7. 배포 및 운영

### CI/CD 파이프라인
```yaml
개발 → 테스트 → 스테이징 → 프로덕션
  ↓       ↓        ↓         ↓
Unit   Integration System   Smoke
Test     Test      Test     Test
```

### 배포 전략
- **Blue-Green Deployment**: 무중단 배포
- **Feature Flags**: 기능별 On/Off 제어
- **Rollback Strategy**: 빠른 롤백 메커니즘
- **Health Checks**: 배포 후 상태 검증

### 인프라 관리
- **Container Orchestration**: Docker + Kubernetes
- **Infrastructure as Code**: Terraform/CloudFormation
- **Service Mesh**: Istio (마이크로서비스 시)
- **Load Balancing**: Application Load Balancer

### 모니터링 및 로깅
- **Application Monitoring**:
  - APM: New Relic/DataDog
  - Error Tracking: Sentry
  - Uptime Monitoring: Pingdom
  
- **Infrastructure Monitoring**:
  - Metrics: Prometheus + Grafana
  - Logs: ELK Stack (Elasticsearch, Logstash, Kibana)
  - Alerts: PagerDuty/Slack 연동

### 백업 및 복구
- **Database Backup**:
  - 일일 자동 백업
  - Point-in-time Recovery
  - Cross-region 복제
  
- **Disaster Recovery**:
  - RTO: 4시간 (Recovery Time Objective)
  - RPO: 1시간 (Recovery Point Objective)
  - DR 훈련 정기 실시

## 8. 제한사항 및 예외처리

### 기술적 제한사항
- **동시 접속자**: 최대 10,000명 (스케일링으로 확장 가능)
- **파일 업로드**: 최대 10MB per file, 100MB per user
- **API Rate Limit**: 사용자당 1,000 requests/hour
- **데이터 보존**: 로그 데이터 90일, 사용자 데이터 무제한

### 예외 처리 전략
- **Circuit Breaker Pattern**: 외부 서비스 장애 대응
- **Retry Mechanism**: 일시적 오류 자동 재시도
- **Graceful Degradation**: 기능 저하 모드
- **Fallback Strategy**: 대체 기능 제공

### 에러 모니터링
- **Error Categorization**: Critical, High, Medium, Low
- **Alert Thresholds**: Error Rate > 5% 시 알림
- **On-call Rotation**: 24/7 기술 지원 체계

## 9. 기술 스택 상세

### Frontend Technology Stack
- **Core**: {answers.get("tech_stack", "React 18").split(',')[0] if answers.get("tech_stack") else "React 18 + TypeScript"}
- **Build Tool**: Vite/Webpack
- **Styling**: Tailwind CSS / Styled Components
- **State Management**: Redux Toolkit / Zustand
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky

### Backend Technology Stack
- **Runtime**: {answers.get("server", "Node.js 18").split(',')[0] if answers.get("server") else "Node.js 18 + TypeScript"}
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL 14 + Redis 6
- **ORM**: Prisma / TypeORM
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (필요시)
- **Cloud Provider**: AWS/GCP/Azure
- **CDN**: CloudFlare / AWS CloudFront
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions / GitLab CI

## 10. 개발 가이드라인

### 코딩 표준
- **JavaScript/TypeScript**: Airbnb Style Guide
- **Git Workflow**: GitFlow 또는 GitHub Flow
- **Commit Convention**: Conventional Commits
- **Code Review**: 최소 2명 승인 필요

### 테스트 전략
- **Unit Tests**: 80% coverage 목표
- **Integration Tests**: API 엔드포인트 전체
- **E2E Tests**: 핵심 사용자 플로우
- **Performance Tests**: Load Testing (JMeter/k6)

### 문서화
- **API Documentation**: OpenAPI/Swagger
- **Code Documentation**: JSDoc/TSDoc
- **Architecture Docs**: C4 Model
- **Runbook**: 운영 가이드 문서

이 기술 사양서는 **task-start** 단계에서 개발 작업 시작 시 핵심 참조 문서로 활용됩니다."""
    
    # 파일들 저장
    save_to_file("docs/requirements.md", requirements_content)
    save_to_file("docs/designed.md", designed_content)
    save_to_file("docs/technical_spec.md", technical_spec_content)
    
    # 상태 파일 삭제
    if Path("docs/.task_new_state.json").exists():
        Path("docs/.task_new_state.json").unlink()
    
    return """✅ 요구사항 문서가 성공적으로 생성되었습니다!

📁 생성된 파일들:
- docs/requirements.md: 프로젝트 요구사항 요약
- docs/designed.md: 디자인 가이드
- docs/technical_spec.md: 기술 사양서

🚀 다음 단계: /task-plan 명령어를 실행하여 프로젝트 계획을 수립하세요."""

@mcp.tool(name="task-new-answer")
async def task_new_answer(answer: str) -> str:
    """새 프로젝트 요구사항 수집 - 사용자 답변 처리
    
    명령어: task-new-answer
    
    Args:
        answer: 사용자의 답변
        
    Returns:
        str: 다음 질문 또는 완료 메시지
    """
    state_file = "docs/.task_new_state.json"
    
    if not check_file_exists(state_file):
        return "❌ 먼저 /task-new 명령으로 질문을 시작해주세요."
    
    with open(state_file, 'r', encoding='utf-8') as f:
        state = json.load(f)
    
    # 현재 질문에 대한 답변 저장
    if state["current_question"] < len(state["questions"]):
        current_key = state["questions"][state["current_question"]]["key"]
        state["answers"][current_key] = answer
        state["current_question"] += 1
        
        # 다음 질문 있는지 확인
        if state["current_question"] < len(state["questions"]):
            current_q = state["questions"][state["current_question"]]
            
            # 상태 저장
            with open(state_file, 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
            
            return f"""📱 새 프로젝트 요구사항 생성 ({state["current_question"] + 1}/7)

**질문 {state["current_question"] + 1}**: {current_q["question"]}

{current_q["example"]}

답변을 입력해주세요."""
        
        # 모든 질문 완료
        result = await _generate_requirements_docs(state["answers"])
        
        # 상태 파일 삭제
        if Path(state_file).exists():
            Path(state_file).unlink()
        
        return result
    
    return "❌ 이미 모든 질문에 답변하셨습니다."

@mcp.tool(name="task-plan")
async def task_plan() -> str:
    """프로젝트 계획 수립 - 요구사항 문서들을 분석하여 작업 계획 생성
    
    명령어: task-plan
    
    Returns:
        str: 계획 수립 결과 메시지
    """
    ensure_docs_dir()
    
    # 필수 파일들 확인
    missing_files = []
    for file_path, error_msg in REQUIRED_FILES.items():
        if not check_file_exists(file_path):
            missing_files.append(f"❌ {error_msg}")
    
    if missing_files:
        return "\n".join(missing_files)
    
    # 요구사항 문서들 로드
    requirements = load_from_file("docs/requirements.md")
    designed = load_from_file("docs/designed.md") 
    technical_spec = load_from_file("docs/technical_spec.md")
    
    # 5단계 사고 프로세스 적용하여 프로젝트 계획 수립
    project_plan = await _generate_project_plan(requirements, designed, technical_spec)
    
    # project_task.md 파일 생성
    save_to_file("docs/project_task.md", project_plan)
    
    return """✅ 작업 계획이 생성되었습니다!
🚀 /task-start로 첫 번째 작업을 시작하세요."""

async def _generate_project_plan(requirements: str, designed: str, technical_spec: str) -> str:
    """5단계 사고 프로세스를 적용한 프로젝트 계획 생성"""
    
    # 요구사항에서 프로젝트명 추출 (간단히 "새 프로젝트"로 설정)
    project_name = "새 프로젝트"
    
    plan_content = f"""# 프로젝트: {project_name}

[ ] 1. 프로젝트 초기 설정 및 환경 구축
**목표**: 개발 환경 준비 및 기본 구조 설계

- [ ] 1.1. 개발 환경 설정
  - [ ] 1.1.1. 기술 스택 선택 및 개발 도구 설치
  - [ ] 1.1.2. 프로젝트 폴더 구조 설계
  - [ ] 1.1.3. 패키지 의존성 관리 설정

- [ ] 1.2. 기본 아키텍처 구현
  - [ ] 1.2.1. 컴포넌트 구조 설계
  - [ ] 1.2.2. 상태 관리 시스템 구축
  - [ ] 1.2.3. 라우팅 시스템 설정

[ ] 2. UI/UX 설계 및 구현
**목표**: 사용자 인터페이스 및 경험 최적화

- [ ] 2.1. UI 컴포넌트 설계
  - [ ] 2.1.1. 디자인 시스템 구축
  - [ ] 2.1.2. 공통 컴포넌트 개발
  - [ ] 2.1.3. 반응형 레이아웃 구현

- [ ] 2.2. 사용자 경험 최적화
  - [ ] 2.2.1. 사용자 플로우 구현
  - [ ] 2.2.2. 접근성 기능 구현
  - [ ] 2.2.3. 성능 최적화

[ ] 3. 핵심 기능 개발
**목표**: 주요 비즈니스 로직 구현

- [ ] 3.1. 기본 기능 구현
  - [ ] 3.1.1. 사용자 인증 시스템
  - [ ] 3.1.2. 데이터 관리 기능
  - [ ] 3.1.3. API 통신 레이어

- [ ] 3.2. 고급 기능 구현
  - [ ] 3.2.1. 외부 서비스 연동
  - [ ] 3.2.2. 실시간 기능 구현
  - [ ] 3.2.3. 알림 시스템 구축

[ ] 4. 테스트 및 품질 보증
**목표**: 안정성 및 품질 확보

- [ ] 4.1. 테스트 구현
  - [ ] 4.1.1. 단위 테스트 작성
  - [ ] 4.1.2. 통합 테스트 구현
  - [ ] 4.1.3. E2E 테스트 설정

- [ ] 4.2. 품질 보증
  - [ ] 4.2.1. 코드 품질 검사
  - [ ] 4.2.2. 성능 최적화
  - [ ] 4.2.3. 보안 검토

[ ] 5. 배포 및 운영
**목표**: 프로덕션 환경 배포 및 운영 체계 구축

- [ ] 5.1. 배포 준비
  - [ ] 5.1.1. 빌드 시스템 구축
  - [ ] 5.1.2. CI/CD 파이프라인 설정
  - [ ] 5.1.3. 환경별 설정 관리

- [ ] 5.2. 운영 체계 구축
  - [ ] 5.2.1. 모니터링 시스템 구축
  - [ ] 5.2.2. 로깅 및 에러 추적
  - [ ] 5.2.3. 백업 및 복구 체계

## 작업 상태 표시
- `[ ]` **대기중**: 아직 시작하지 않은 작업
- `[-]` **진행중**: 현재 작업 중인 작업  
- `[x]` **완료**: 완료된 작업
"""
    return plan_content

@mcp.tool(name="task-start") 
async def task_start() -> str:
    """다음 작업 시작 및 완료 관리
    
    명령어: task-start
    
    Returns:
        str: 작업 시작 결과 메시지
    """
    # 필수 파일 확인
    if not check_file_exists("docs/project_task.md"):
        return "❌ 작업 파일이 없습니다. 먼저 /task-plan으로 계획을 수립하세요."
    
    # project_task.md 로드
    task_content = load_from_file("docs/project_task.md")
    
    # 다음 작업 찾기 ([ ] 상태의 첫 번째 작업)
    lines = task_content.split('\n')
    next_task = None
    next_task_line = -1
    
    for i, line in enumerate(lines):
        if line.strip().startswith('- [ ]') and '.' in line:
            # 중분류 작업 찾기
            next_task = line.strip()
            next_task_line = i
            break
        elif line.strip().startswith('[ ]') and '.' in line:
            # 대분류 작업 찾기
            next_task = line.strip()
            next_task_line = i
            break
    
    if not next_task:
        return "🎉 모든 작업이 완료되었습니다!"
    
    # 작업 ID와 이름 추출
    task_parts = next_task.split(' ', 2)
    if len(task_parts) >= 3:
        task_id = task_parts[1]
        task_name = task_parts[2]
    else:
        task_id = "작업"
        task_name = next_task
    
    # 작업 상태를 진행중([-])으로 변경
    lines[next_task_line] = next_task.replace('[ ]', '[-]')
    updated_content = '\n'.join(lines)
    save_to_file("docs/project_task.md", updated_content)
    
    # 디자인 파일 생성 확인 (UI, UX, 화면, 디자인 키워드 포함 시)
    design_keywords = ['UI', 'UX', '화면', '디자인', '인터페이스']
    needs_design = any(keyword in task_name for keyword in design_keywords)
    
    design_msg = ""
    if needs_design:
        await _update_design_file(task_name)
        design_msg = "\n📝 디자인 파일(docs/design.md)이 업데이트되었습니다!"
    
    return f"""🚀 {task_id} {task_name} 시작{design_msg}

📋 현재 작업: {task_name}

5단계 분석을 적용하여 작업을 진행하세요:
1. 요구사항 분석: 작업의 목적과 범위 파악
2. 아키텍처 설계: 구현 방법과 구조 설계  
3. 확장성 검증: 미래 확장 가능성 고려
4. 구현 전략: 구체적 실행 계획 수립
5. 코드 구현: 실제 구현 및 테스트

작업을 완료하면 /task-complete를 실행하세요."""

async def _update_design_file(task_name: str) -> None:
    """디자인 관련 작업 시 design.md 파일 업데이트"""
    design_content = f"""# 프로젝트 디자인 문서

## 현재 작업: {task_name}

### 5단계 디자인 사고 프로세스

#### 1. 사용자 요구사항 분석
- 사용자 목표와 경험 중심 분석
- 사용자 페르소나 및 사용자 여정 검토

#### 2. 디자인 원칙 설계  
- UI/UX 가이드라인 정의
- 일관성, 접근성, 사용자 중심 설계 원칙

#### 3. 사용자 흐름 및 상호작용 검증
- UX 플로우 유효성 확인
- 사용자 인터랙션 패턴 최적화

#### 4. 디자인 구현 전략
- 컴포넌트와 프로토타입 계획
- 반응형 및 접근성 고려사항

#### 5. 디자인 피드백 및 최적화
- 완성도와 재사용성 향상
- 지속적인 개선 계획

### 디자인 룰
- **UI/UX 원칙**: 일관성, 접근성, 사용자 중심 설계
- **색상 팔레트**: 주요 색상, 보조 색상, 테마 호환
- **타이포그래피**: 폰트 스타일, 크기, 계층 구조  
- **반응형 설계**: 모바일, 태블릿, 데스크톱 지원

### 디자인맵
- **컴포넌트 구조**: 버튼, 입력 필드, 네비게이션 바
- **화면 흐름**: 사용자 경험 최적화된 플로우
- **와이어프레임**: 텍스트 기반 레이아웃 설명

작업 일시: {asyncio.get_event_loop().time()}
"""
    save_to_file("docs/design.md", design_content)



@mcp.tool(name="task-resume")
async def task_resume() -> str:
    """작업 재개 - 기존 프로젝트 이어서 진행
    
    명령어: task-resume
    
    Returns:
        str: 작업 재개 결과 메시지
    """
    if not check_file_exists("docs/project_task.md"):
        return "❌ 프로젝트 파일이 없습니다. 먼저 /task-plan으로 계획을 수립하세요."
    
    # 현재 상황 분석
    task_content = load_from_file("docs/project_task.md")
    lines = task_content.split('\n')
    
    # 진행중인 작업이 있는지 확인
    current_task = None
    for line in lines:
        if '[-]' in line:
            task_parts = line.strip().split(' ', 2)
            if len(task_parts) >= 3:
                current_task = f"{task_parts[1]} {task_parts[2]}"
            break
    
    if current_task:
        return f"""📋 이전 작업을 이어서 진행합니다.

🚀 현재 진행중: {current_task}

작업을 완료하면 /task-start를 실행하여 다음 작업을 시작하세요."""
    
    # 진행중인 작업이 없으면 다음 작업 시작
    return await task_start()



@mcp.tool(name="task-clean")
async def task_clean() -> str:
    """프로젝트 파일들을 삭제하고 초기화
    
    명령어: task-clean
    
    Returns:
        str: 삭제 결과 메시지
    """
    import shutil
    
    deleted_files = []
    
    # docs 디렉토리 전체 삭제
    if DOCS_DIR.exists():
        try:
            shutil.rmtree(DOCS_DIR)
            deleted_files.append("📁 docs/ 디렉토리")
        except Exception as e:
            return f"❌ docs 디렉토리 삭제 실패: {e}"
    
    # claude.md 파일 삭제
    claude_file = Path("claude.md")
    if claude_file.exists():
        try:
            claude_file.unlink()
            deleted_files.append("📄 claude.md")
        except Exception as e:
            return f"❌ claude.md 삭제 실패: {e}"
    
    # mcp task state 파일 삭제 (있다면)
    state_file = Path(".mcp_task_state.json")
    if state_file.exists():
        try:
            state_file.unlink()
            deleted_files.append("📄 .mcp_task_state.json")
        except Exception as e:
            return f"❌ 상태 파일 삭제 실패: {e}"
    
    if deleted_files:
        return f"""🧹 프로젝트 초기화 완료!

삭제된 파일:
{chr(10).join('✅ ' + file for file in deleted_files)}

🚀 새 프로젝트를 시작하려면 /task-new를 실행하세요."""
    else:
        return "✨ 삭제할 파일이 없습니다. 프로젝트가 이미 깨끗합니다."

if __name__ == "__main__":
    # 서버 실행
    mcp.run()