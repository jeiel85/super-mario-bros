# 🍄 Super Mario Bros. (NES 1985) Web Edition

> 1985년 전설의 닌텐도 패미컴(NES) **슈퍼마리오 브라더스 (Super Mario Bros. World 1-1 + 지하 보너스 방)**를 99% 동일한 물리·그래픽·사운드로 재현한 고품질 웹앱입니다.

![Super Mario Bros Preview](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png)

---

## 🌟 주요 특징 (99% 싱크로율)

- **🕹️ 60FPS 서브픽셀 NES 물리 엔진**:
  - 가변 점프 높이: 점프 버튼 체공 시간에 비례한 점프 높이 제어
  - 가속도 및 관성 보행/질주 (대시 시 2.56 px/f)
  - 급제동(스키드) 동작, 흙먼지 파티클 및 전용 사운드
  - 1칸 낭떠러지 전력질주 통과
  - 블록 밑치기 충격파 (작은 마리오는 튕김, 슈퍼 마리오는 벽돌 파괴, 상단 굼바 뒤집힘 즉사)
- **👾 4단 상태 머신 & 적 메커니즘**:
  - 꼬마 마리오, 슈퍼 마리오, 파이어 마리오(파이어볼 투척), 무적 스타 마리오
  - 굼바 찌그러짐 판정, 엉금엉금 등껍질 차기 및 벽면 바운스 연쇄 킬 콤보
- **🗺️ 완벽한 World 1-1 레벨 & 4번 파이프 지하 보너스 방**:
  - 원작의 모든 타일, 물음표 블록, 버섯/스타/코인 위치 100% 일치
  - 4번 파이프 숙이기(<kbd>▼</kbd> / <kbd>S</kbd>)로 지하 19개 코인 방 입장 및 출구 워프
  - 깃대 착지 높이에 따른 보너스 점수(100~5000점) 및 성문 입장 시퀀스
- **🔊 Web Audio API 기반 8-bit APU 사운드 합성 (외부 오디오 파일 0%)**:
  - 2 Pulse + 1 Triangle + 1 Noise 채널을 활용한 지상, 지하, 스타, 팡파르, 게임오버 BGM
  - 점프, 코인, 파워업, 파이프, 킥 등 모든 효과음 실시간 합성
- **📱 반응형 컨트롤**:
  - 데스크톱 키보드 조작 및 모바일/태블릿용 가상 D-Pad / B, A 버튼 지원
  - 📺 레트로 CRT 브라운관 스캔라인 필터 On/Off 토글

---

## 🎮 조작 방법

### 키보드
| 동작 | 키 |
|---|---|
| **이동** | <kbd>◀</kbd> <kbd>▶</kbd> 또는 <kbd>A</kbd> <kbd>D</kbd> |
| **숙이기 / 파이프 진입** | <kbd>▼</kbd> 또는 <kbd>S</kbd> |
| **점프 (A 버튼)** | <kbd>Z</kbd> 또는 <kbd>K</kbd> 또는 <kbd>Space</kbd> |
| **대시 / 파이어볼 (B 버튼)** | <kbd>X</kbd> 또는 <kbd>J</kbd> 또는 <kbd>Shift</kbd> |
| **시작 / 일시정지** | <kbd>Enter</kbd> |

### 터치 (모바일/태블릿)
- 화면 좌측 하단 가상 D-Pad 및 우측 하단 B / A 액션 버튼

---

## 🚀 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 📄 라이선스
MIT License
