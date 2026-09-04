import type { ConceptKey, GradeBand, LessonLevel, Standard } from '../types/curriculum';

export const CONCEPTS: Record<ConceptKey, { label: string; cssVar: string }> = {
  seq: { label: '순차', cssVar: '--color-seq' },
  loop: { label: '반복', cssVar: '--color-loop' },
  cond: { label: '조건', cssVar: '--color-cond' },
  data: { label: '변수·데이터', cssVar: '--color-data' },
  func: { label: '함수·추상화', cssVar: '--color-func' },
  ds: { label: '자료구조', cssVar: '--color-ds' },
  algo: { label: '알고리즘 설계', cssVar: '--color-algo' },
  ai: { label: '인공지능', cssVar: '--color-ai' },
};

export const CONCEPT_ORDER: ConceptKey[] = ['seq', 'loop', 'cond', 'data', 'func', 'ds', 'algo', 'ai'];

export const GRADE_BANDS: Record<GradeBand, { label: string; subject: string; hours: string }> = {
  e34: { label: '초 3~4', subject: '교과 외 준비 단계', hours: '언플러그드 중심' },
  e56: { label: '초 5~6', subject: '실과', hours: '34시간' },
  m: { label: '중 1~3', subject: '정보', hours: '68시간' },
  h: { label: '고등', subject: '정보(일반선택)', hours: '학교 편성' },
};

export const LEVELS: Record<LessonLevel, string> = { 1: '입문', 2: '기본', 3: '심화' };

/**
 * 2022 개정 교육과정 성취기준 원문.
 * 출처: 교육부 고시 실과(기술·가정)/정보과 교육과정.
 * 새 미션을 추가할 때 여기에 코드가 없으면 먼저 등록한다.
 */
export const STANDARDS: Standard[] = [
  { code: '[6실05-01]', band: 'e56', text: '컴퓨터를 활용한 생활 속 문제해결 사례를 탐색하고, 일상생활 속 문제를 해결하기 위한 알고리즘을 다양한 방법으로 표현한다.' },
  { code: '[6실05-02]', band: 'e56', text: '프로그래밍 도구를 사용하여 기초적인 프로그램을 작성한다.' },
  { code: '[6실05-03]', band: 'e56', text: '문제를 해결하는 프로그램을 협력하여 작성하고 공유한다.' },
  { code: '[9정02-03]', band: 'm', text: '실생활의 데이터를 표, 다이어그램 등 다양한 형태로 구조화한다.' },
  { code: '[9정03-01]', band: 'm', text: '문제의 상태를 정의하고 수행 가능한 형태로 구조화한다.' },
  { code: '[9정03-02]', band: 'm', text: '문제 해결을 위한 추상화의 중요성을 이해하고, 핵심요소를 중심으로 알고리즘을 표현한다.' },
  { code: '[9정03-03]', band: 'm', text: '알고리즘의 중요성을 이해하고, 문제를 해결하는 다양한 알고리즘을 비교·분석한다.' },
  { code: '[9정03-05]', band: 'm', text: '데이터를 순차적으로 저장할 수 있는 구조를 활용하여 문제 해결 프로그램을 작성한다.' },
  { code: '[9정03-06]', band: 'm', text: '논리 연산과 중첩 제어 구조를 활용하여 문제를 해결하는 프로그램을 작성한다.' },
  { code: '[9정03-07]', band: 'm', text: '프로그램 작성에서 함수를 활용하고, 프로그램 수행 결과를 디버거로 분석하여 오류를 수정한다.' },
  { code: '[9정03-08]', band: 'm', text: '실생활의 문제를 탐색하여 발견하고, 프로그래밍을 통해 해결한다.' },
  { code: '[9정04-02]', band: 'm', text: '인공지능 학습에서 데이터의 중요성을 이해하고, 학습에 필요한 데이터를 수집하여 분류한다.' },
  { code: '[12정03-01]', band: 'h', text: '복잡한 문제를 분해하고 모델링한다.' },
  { code: '[12정03-02]', band: 'h', text: '정렬 알고리즘의 특징과 효율을 비교·분석한다.' },
  { code: '[12정03-03]', band: 'h', text: '탐색 알고리즘의 특징과 효율을 비교·분석한다.' },
  { code: '[12정03-06]', band: 'h', text: '다차원 데이터 구조를 활용한 프로그램을 작성한다.' },
  { code: '[12정03-09]', band: 'h', text: '실생활의 문제 해결을 위해 협력하여 프로그램을 설계·구현한다.' },
  { code: '[12정04-02]', band: 'h', text: '기계학습의 개념을 이해하고 지도학습과 비지도학습을 비교·분석한다.' },
];

export const STANDARD_TEXT: Record<string, string> = Object.fromEntries(
  STANDARDS.map((s) => [s.code, s.text]),
);
