# 🍄 Super Mario Bros. (NES 1985) - 100% Complete 32-Stage Web Edition

> 1985년 전설의 닌텐도 패미컴(NES) **슈퍼마리오 브라더스 (Super Mario Bros. World 1-1 ~ 8-4 엔딩)**를 **원작 NES ROM 바이트스트림 디코더 엔진**으로 100% 완전 복원한 웹 애플리케이션입니다.

### 🎮 **[👉 라이브 데모 플레이하기 (Click to Play)](https://jeiel85.github.io/super-mario-bros/)**

---

## 🌟 100% 완전 클론 핵심 특징

### 1. 🏰 전체 32개 스테이지 NES ROM 바이트코드 디코더
- **원작 NES ROM 압축 스트림 디코딩**: 34개 지형 에어리어(`L_GroundArea`, `L_WaterArea`, `L_UndergroundArea`, `L_CastleArea`) 및 34개 적 에어리어 바이트스트림 100% 해독
- **World 1-1 ~ 8-4 연쇄 진행**: 타이틀 화면에서 32개 스테이지 즉시 선택 가능 (<kbd>◀</kbd> / <kbd>▶</kbd>)
- **4대 테마 완벽 렌더링 & 고유 물리 엔진**:
  - **지상(Overworld)**: 상쾌한 하늘과 구름, 부시, 블록, 깃대 강하
  - **지하(Underground)**: 칠흑 배경, 코발트 블루 지하 블록, 지저 BGM
  - **수중(Underwater)**: 감청색 심해 배경, 산호초 타일, 물속 부력 및 헤엄치기(Swimming Physics), 수중 왈츠 BGM
  - **성채(Castle)**: 용암 타일, 회전 파이어바(Firebar), 도약 포돌보(Podoboo), 쿠파 도끼 다리, 성채 BGM

### 2. 🦖 쿠파(Bowser) 보스전 & 8-4 피치 공주 구출 엔딩
- **쿠파 보스 AI**: 좌우 패트롤, 도약 점프, 화염 방사(`BowserFlame`), 후반 월드 해머 투척(`BowserHammer`), 파이어볼 5회 피격 HP 시스템
- **도끼(Axe) & 다리 붕괴**: 도끼 터치 시 다리 블록 연쇄 소멸 $\rightarrow$ 쿠파 용암 추락 $\rightarrow$ 5000점 획득 $\rightarrow$ 마리오 알현실 진입
- **키노피오(Toad) 다이얼로그 (1-4 ~ 7-4)**: `"THANK YOU MARIO! BUT OUR PRINCESS IS IN ANOTHER CASTLE!"`
- **피치 공주(Princess Peach) 최종 엔딩 (8-4)**: `"THANK YOU MARIO! YOUR QUEST IS OVER. WE PRESENT YOU A NEW QUEST. PUSH BUTTON B TO SELECT WORLD"`

### 3. 🤖 스마트 자동 진행 (AI Autopilot Mode)
- **원터치 자동 플레이**: <kbd>P</kbd> 키 또는 툴바의 `[ 🤖 AUTO PLAY ]` 버튼 클릭 시 발동
- **지능형 센서**: 전방 낭떠러지 감지 후 전력질주 도약, 파이프/계단 장애물 높이 계산 점프, 굼바/엉금엉금 밟기 및 파이어볼 조준 사격, 쿠파전 도끼 점프 공략까지 자동으로 스테이지를 돌파합니다.

### 4. 🕹️ 60FPS 서브픽셀 NES 물리 엔진
- 가변 점프 높이: 점프 버튼 체공 시간에 비례한 점프 높이 제어
- 가속도 및 관성 보행/질주 (대시 시 2.56 px/f)
- 급제동(스키드) 동작, 흙먼지 파티클 및 전용 사운드
- 1칸 낭떠러지 전력질주 통과
- 블록 밑치기 충격파 (작은 마리오는 튕김, 슈퍼 마리오는 벽돌 파괴, 상단 굼바 뒤집힘 즉사)

### 5. 👾 4단 상태 머신 & 캐릭터
- 꼬마 마리오, 슈퍼 마리오, 파이어 마리오(파이어볼 투척), 무적 스타 마리오
- **2-Player 루이지(Luigi) 모드**: 타이틀 화면에서 <kbd>Shift</kbd>(Select)로 1P/2P 전환, 원작 1985년 클래식 녹색 모자/셔츠 + 흰색 멜빵 배색의 루이지 플레이 가능

### 6. 🔊 Web Audio API 기반 8-bit APU 사운드 합성 (외부 오디오 파일 0%)
- 2 Pulse + 1 Triangle + 1 Noise 채널을 활용한 지상, 지하, 수중, 성채, 스타, 팡파르, 게임오버 BGM
- 점프, 코인, 파워업, 파이프, 킥, 포즈, 폭죽, 쿠파 화염, 보스 추락 등 모든 효과음 실시간 합성

### 7. 📱 반응형 컨트롤 & CRT 효과
- 데스크톱 키보드 조작 및 모바일/태블릿용 가상 D-Pad / B, A 버튼 지원
- 📺 레트로 CRT 브라운관 스캔라인 필터 On/Off 토글

---

## 🎮 조작 방법

### 키보드
| 동작 | 키 |
|---|---|
| **이동** | <kbd>◀</kbd> <kbd>▶</kbd> 또는 <kbd>A</kbd> <kbd>D</kbd> |
| **앉기 / 파이프 진입** | <kbd>▼</kbd> 또는 <kbd>S</kbd> |
| **점프 (A 버튼)** | <kbd>Z</kbd> 또는 <kbd>K</kbd> 또는 <kbd>Space</kbd> |
| **대시 / 공격 (B 버튼)** | <kbd>X</kbd> 또는 <kbd>J</kbd> |
| **자동 진행 (Auto Play On/Off)** | <kbd>P</kbd> 또는 <kbd>O</kbd> |
| **모드 / 스테이지 선택** | <kbd>Shift</kbd> (1P/2P) ┃ <kbd>◀</kbd> <kbd>▶</kbd> (스테이지 변경) |
| **시작 / 일시정지 (Start / Pause)** | <kbd>Enter</kbd> |

### 터치 (모바일/태블릿)
- 화면 좌측 하단 가상 D-Pad 및 우측 하단 B / A 액션 버튼

---

## 🚀 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 📄 라이선스
MIT License
