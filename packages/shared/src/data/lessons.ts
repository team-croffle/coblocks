import type { Lesson, StageConfig } from '../types/curriculum';

/** 기본 스테이지: 8×8, 좌하단에서 출발해 우상단 별까지. */
export const DEFAULT_STAGE: StageConfig = {
  size: 8,
  start: { x: 0, y: 7, dir: 0 },
  goal: { x: 6, y: 1 },
  walls: [
    [2, 7], [2, 6], [2, 5],
    [4, 4], [4, 3], [4, 2],
    [5, 5], [6, 5],
  ],
};

type Seed = Omit<Lesson, 'id' | 'status' | 'orderIndex'> & Partial<Pick<Lesson, 'status'>>;

const seed = (rows: Seed[]): Lesson[] =>
  rows.map((r, i) => ({
    ...r,
    id: r.slug,
    status: r.status ?? 'published',
    orderIndex: i,
  }));

/**
 * 커리큘럼 시드.
 * 미션 구성과 차시는 성취기준을 근거로 만든 예시안이며 교과서 단원과 1:1 대응하지 않는다.
 */
export const LESSON_SEED: Lesson[] = seed([
  {
    slug: 'morning-order-cards', title: '아침 준비 순서 카드', band: 'e34', concept: 'seq', level: 1, periods: 2,
    standardCode: null, blockLabels: ['순서 카드', '언플러그드'], stage: null,
    description: '등교 준비 과정을 카드로 늘어놓고 순서를 바꿔 봅니다. 순서가 달라지면 결과가 달라진다는 것을 몸으로 확인합니다.',
  },
  {
    slug: 'maze-robot-play', title: '미로 탈출 로봇 놀이', band: 'e34', concept: 'loop', level: 1, periods: 2,
    standardCode: null, blockLabels: ['앞으로 가기', '반복하기'], stage: DEFAULT_STAGE,
    description: '친구를 로봇이라 생각하고 앞으로·돌기 명령만으로 미로를 빠져나옵니다. 같은 명령이 반복될 때 묶는 방법을 찾습니다.',
  },
  {
    slug: 'pattern-finding', title: '규칙 찾아 무늬 잇기', band: 'e34', concept: 'algo', level: 1, periods: 2,
    standardCode: null, blockLabels: ['패턴 인식'], stage: null,
    description: '반복되는 무늬에서 규칙을 찾아 다음 칸을 예측합니다. 패턴 인식이 알고리즘의 출발점임을 경험합니다.',
  },
  {
    slug: 'square-to-star', title: '정사각형에서 별 모양까지', band: 'e56', concept: 'loop', level: 1, periods: 3,
    standardCode: '[6실05-01]', blockLabels: ['n번 반복하기', '앞으로 가기', '방향 돌리기'], stage: DEFAULT_STAGE,
    description: '같은 명령을 여러 번 쓰는 대신 반복 블록으로 묶습니다. 반복 횟수와 각도만 바꿔 다양한 도형을 그립니다.',
  },
  {
    slug: 'lunch-recommender', title: '우리 반 급식 추천 봇', band: 'e56', concept: 'cond', level: 2, periods: 4,
    standardCode: '[6실05-01]', blockLabels: ['만약 ~라면', '아니면', '묻고 기다리기'], stage: DEFAULT_STAGE,
    description: '요일과 날씨에 따라 다른 답을 내놓는 조건 블록을 만듭니다. 조건이 여러 개일 때 순서가 중요하다는 것을 다룹니다.',
  },
  {
    slug: 'score-quiz', title: '점수를 기억하는 퀴즈 게임', band: 'e56', concept: 'data', level: 2, periods: 4,
    standardCode: '[6실05-02]', blockLabels: ['변수 만들기', '변수 값 바꾸기'], stage: null,
    description: '변수에 점수를 저장하고 정답일 때마다 값을 바꿉니다. 값이 남아 있다는 개념을 화면 표시로 확인합니다.',
  },
  {
    slug: 'flowchart-daily', title: '생활 속 문제 순서도로 그리기', band: 'e56', concept: 'algo', level: 2, periods: 3,
    standardCode: '[6실05-01]', blockLabels: ['순서도', '의사코드'], stage: null,
    description: '횡단보도 건너기, 분리배출처럼 익숙한 일을 순서도로 표현합니다. 같은 문제도 표현 방법이 여럿임을 비교합니다.',
  },
  {
    slug: 'pair-mini-game', title: '둘이서 만드는 미니 게임', band: 'e56', concept: 'seq', level: 2, periods: 5,
    standardCode: '[6실05-03]', blockLabels: ['리믹스', '공유하기'], stage: null,
    description: '역할을 나눠 배경과 캐릭터를 각각 만들고 합칩니다. 프로젝트를 공유하고 서로의 블록을 읽어 봅니다.',
  },
  {
    slug: 'state-decomposition', title: '문제를 상태로 쪼개기', band: 'm', concept: 'algo', level: 2, periods: 3,
    standardCode: '[9정03-01]', blockLabels: ['문제 정의', '상태 표현'], stage: null,
    description: '해결하려는 문제의 시작 상태, 목표 상태, 가능한 동작을 정의합니다. 막연한 문제를 다룰 수 있는 형태로 바꿉니다.',
  },
  {
    slug: 'abstraction-drill', title: '핵심만 남기는 추상화 연습', band: 'm', concept: 'func', level: 2, periods: 3,
    standardCode: '[9정03-02]', blockLabels: ['추상화', '모델링'], stage: null,
    description: '지하철 노선도처럼 불필요한 정보를 걷어내고 핵심 요소만으로 알고리즘을 표현합니다.',
  },
  {
    slug: 'same-problem-two-ways', title: '같은 문제, 다른 알고리즘', band: 'm', concept: 'algo', level: 3, periods: 4,
    standardCode: '[9정03-03]', blockLabels: ['순차 탐색', '이분 탐색', '비교하기'], stage: null,
    description: '숫자 맞히기를 하나씩 세는 방법과 절반씩 줄이는 방법으로 각각 풀고 시도 횟수를 비교합니다.',
  },
  {
    slug: 'nested-loop-table', title: '중첩 반복으로 그리는 구구단 판', band: 'm', concept: 'loop', level: 2, periods: 4,
    standardCode: '[9정03-06]', blockLabels: ['중첩 반복', '논리 연산'], stage: DEFAULT_STAGE,
    description: '반복 안에 반복을 넣습니다. 바깥 반복과 안쪽 반복의 역할을 표로 정리해 확인합니다.',
  },
  {
    slug: 'class-library-list', title: '리스트로 관리하는 학급 도서', band: 'm', concept: 'ds', level: 2, periods: 4,
    standardCode: '[9정03-05]', blockLabels: ['리스트 만들기', '항목 추가', '항목 찾기'], stage: null,
    description: '책 목록을 리스트에 저장하고 추가·삭제·검색하는 프로그램을 만듭니다. 순차 자료구조의 필요성을 체감합니다.',
  },
  {
    slug: 'function-and-debugger', title: '함수로 정리하고 디버거로 고치기', band: 'm', concept: 'func', level: 3, periods: 4,
    standardCode: '[9정03-07]', blockLabels: ['나만의 블록', '매개변수', '한 단계 실행'], stage: DEFAULT_STAGE,
    description: '반복되는 블록 묶음을 나만의 블록(함수)으로 만들고, 한 단계씩 실행하며 오류의 위치를 찾습니다.',
  },
  {
    slug: 'school-data-structuring', title: '우리 학교 데이터 구조화하기', band: 'm', concept: 'data', level: 2, periods: 4,
    standardCode: '[9정02-03]', blockLabels: ['표 만들기', '시각화'], stage: null,
    description: '설문으로 모은 데이터를 표와 다이어그램으로 정리하고, 항목 사이의 관계를 해석합니다.',
  },
  {
    slug: 'teachable-image-model', title: '가르쳐서 분류하는 이미지 모델', band: 'm', concept: 'ai', level: 2, periods: 4,
    standardCode: '[9정04-02]', blockLabels: ['모델 학습하기', '분류 결과'], stage: null,
    description: '직접 모은 이미지로 분류 모델을 학습시키고 블록으로 불러 씁니다. 데이터가 편향되면 결과가 어떻게 달라지는지 확인합니다.',
  },
  {
    slug: 'blocks-beside-python', title: '블록 옆에 파이썬 나란히 보기', band: 'm', concept: 'seq', level: 3, periods: 3,
    standardCode: '[9정03-08]', blockLabels: ['블록↔코드 보기'], stage: DEFAULT_STAGE,
    description: '완성한 블록 프로그램을 텍스트 코드와 나란히 놓고 한 줄씩 대응시킵니다. 텍스트 코딩으로 건너가는 다리 역할을 합니다.',
  },
  {
    slug: 'sorting-race', title: '정렬 알고리즘 경주', band: 'h', concept: 'algo', level: 3, periods: 4,
    standardCode: '[12정03-02]', blockLabels: ['선택 정렬', '삽입 정렬', '병합 정렬'], stage: null,
    description: '선택·삽입·병합 정렬을 같은 데이터에 돌려 비교 횟수를 세어 봅니다. 데이터가 커질 때 차이가 어떻게 벌어지는지 관찰합니다.',
  },
  {
    slug: 'search-efficiency', title: '탐색 효율 직접 재보기', band: 'h', concept: 'algo', level: 3, periods: 3,
    standardCode: '[12정03-03]', blockLabels: ['탐색 비교', '계측하기'], stage: null,
    description: '순차 탐색과 이분 탐색의 실행 단계를 계측해 자료 크기별 그래프로 그립니다.',
  },
  {
    slug: 'minesweeper-grid', title: '2차원 배열로 만드는 지뢰찾기', band: 'h', concept: 'ds', level: 3, periods: 5,
    standardCode: '[12정03-06]', blockLabels: ['2차원 배열', '인덱스 계산'], stage: null,
    description: '격자를 2차원 자료구조로 표현하고 주변 칸을 세는 로직을 구현합니다.',
  },
  {
    slug: 'decompose-and-model', title: '복잡한 문제 분해하고 모델링하기', band: 'h', concept: 'func', level: 3, periods: 4,
    standardCode: '[12정03-01]', blockLabels: ['문제 분해', '모듈 설계'], stage: null,
    description: '학교 시간표 배정 같은 큰 문제를 하위 문제로 나누고, 각각을 함수로 설계합니다.',
  },
  {
    slug: 'team-problem-app', title: '팀으로 만드는 실생활 문제 해결 앱', band: 'h', concept: 'seq', level: 3, periods: 8,
    standardCode: '[12정03-09]', blockLabels: ['협업', '버전 관리', '성능 평가'], stage: null,
    description: '주제 선정부터 설계·구현·성능 평가까지 팀으로 진행하고 결과를 공유합니다.',
  },
  {
    slug: 'supervised-vs-unsupervised', title: '지도학습과 비지도학습 비교하기', band: 'h', concept: 'ai', level: 3, periods: 4,
    standardCode: '[12정04-02]', blockLabels: ['지도학습', '비지도학습'], stage: null,
    description: '같은 데이터셋을 분류와 군집으로 각각 다뤄 보고, 어떤 문제에 무엇이 맞는지 판단합니다.',
  },
]);
