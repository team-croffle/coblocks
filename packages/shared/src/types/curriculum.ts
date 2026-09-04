/** 2022 개정 교육과정 기준 학년군. e34 는 교과 성취기준이 없는 준비 단계. */
export type GradeBand = 'e34' | 'e56' | 'm' | 'h';

/** 블록 색과 1:1로 대응하는 개념 축. 색은 web 쪽 토큰(--c-*)에서 정의한다. */
export type ConceptKey =
  | 'seq'
  | 'loop'
  | 'cond'
  | 'data'
  | 'func'
  | 'ds'
  | 'algo'
  | 'ai';

/** 1 입문 / 2 기본 / 3 심화 */
export type LessonLevel = 1 | 2 | 3;

export type LessonStatus = 'draft' | 'published' | 'archived';

/** 성취기준 코드. 예: '[6실05-01]', '[9정03-06]', '[12정03-02]' */
export type StandardCode = string;

export interface Standard {
  code: StandardCode;
  /** 고시 원문 문장 */
  text: string;
  band: GradeBand;
}

export interface StageConfig {
  /** 정사각 격자 한 변의 칸 수 */
  size: number;
  start: { x: number; y: number; dir: 0 | 1 | 2 | 3 };
  goal: { x: number; y: number };
  /** [x, y] 좌표 목록 */
  walls: Array<[number, number]>;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  band: GradeBand;
  concept: ConceptKey;
  level: LessonLevel;
  /** 예상 차시 */
  periods: number;
  /** 없으면 교과 외 준비 단계 */
  standardCode: StandardCode | null;
  /** 학생에게 노출할 블록 라벨 */
  blockLabels: string[];
  stage: StageConfig | null;
  status: LessonStatus;
  orderIndex: number;
}

/** 목록/카드용 축약형 */
export type LessonSummary = Pick<
  Lesson,
  'id' | 'slug' | 'title' | 'description' | 'band' | 'concept' | 'level' | 'periods' | 'standardCode' | 'blockLabels'
>;

export interface LessonQuery {
  q?: string;
  bands?: GradeBand[];
  concepts?: ConceptKey[];
  levels?: LessonLevel[];
  status?: LessonStatus;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ProgressState = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  lessonId: string;
  state: ProgressState;
  /** 마지막으로 저장한 블록 프로그램 */
  program: unknown;
  attempts: number;
  completedAt: string | null;
  updatedAt: string;
}
