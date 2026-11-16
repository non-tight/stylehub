# 스타일허브 구축 진행 기록

## 체크리스트
- [x] 0. Claude 유료 계정 생성, GitHub 가입·연결
- [x] 1. GitHub 저장소(stylehub) 생성
- [x] 2. Claude Code 저장소 접근 허용
- [x] 3. CLAUDE.md, progress.md 작성
- [ ] 4. 사이트 구성 기획 (대분류·소분류, 스타일 태그, 분위기)
- [ ] 5. Astro 뼈대 설치 + 배포 설정
- [ ] 6. GitHub Pages 배포 및 주소 확인
- [ ] 7. 디자인·페이지 제작 (메인, 카테고리, 태그, 소개·신고)
- [ ] 8. 상품 추가·수정 반복
- [ ] 9. 예약 작업(링크 점검) 설정

## 작업 기록
### 2026-11-16 · 1~2단계
- 한 일: GitHub에 stylehub 저장소(Public, README 포함) 생성, Claude Code 접근 허용
- 결정한 것: 프레임워크는 Astro 사용 (Next.js 대비 구조가 단순하고 상품 데이터 관리에 적합)

### 2026-11-16 · 3단계
- 한 일: 저장소 맨 위에 CLAUDE.md(프로젝트 규칙), docs/progress.md(진행 기록) 작성
- 결정한 것: 데이터는 src/data/categories.json·products.json으로 관리, 브랜드·구단·캐릭터명 및 "정품급·미러급·레플리카·OO st" 표현 금지, 하단에 판매처 책임 안내문·권리침해 신고 이메일 표시, 세션 시작 시 progress.md를 먼저 확인
