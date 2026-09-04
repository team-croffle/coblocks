import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  CONCEPT_ORDER,
  CONCEPTS,
  GRADE_BANDS,
  LESSON_SEED,
  LEVELS,
  type ConceptKey,
  type GradeBand,
  type LessonLevel,
} from '@coblocks/shared';
import { createLesson, updateLesson } from '@/api/admin';

interface FormState {
  title: string;
  band: GradeBand;
  concept: ConceptKey;
  level: LessonLevel;
  periods: number;
  standardCode: string;
  description: string;
  blockLabels: string;
  stageNote: string;
}

const EMPTY: FormState = {
  title: '',
  band: 'e56',
  concept: 'loop',
  level: 2,
  periods: 4,
  standardCode: '',
  description: '',
  blockLabels: '',
  stageNote: '8x8 · 시작 (0,7) · 목표 (6,1) · 벽 8칸',
};

/** 수정 모드면 기존 값으로 시작한다. TODO: 서버 단건 조회로 교체 */
function initialFor(id: string | undefined): FormState {
  if (!id) return EMPTY;
  const found = LESSON_SEED.find((l) => l.id === id);
  if (!found) return EMPTY;
  return {
    title: found.title,
    band: found.band,
    concept: found.concept,
    level: found.level,
    periods: found.periods,
    standardCode: found.standardCode ?? '',
    description: found.description,
    blockLabels: found.blockLabels.join(', '),
    stageNote: found.stage
      ? `${found.stage.size}x${found.stage.size} · 목표 (${found.stage.goal.x},${found.stage.goal.y})`
      : '스테이지 없음',
  };
}

export function LessonFormPage() {
  // /admin/lessons/new 와 /admin/lessons/$id/edit 이 같은 컴포넌트를 쓴다.
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(() => initialFor(id));
  const [notice, setNotice] = useState('');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      band: form.band,
      concept: form.concept,
      level: form.level,
      periods: Number(form.periods),
      standardCode: form.standardCode.trim() || null,
      description: form.description,
      blockLabels: form.blockLabels
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (id) await updateLesson(id, payload);
      else await createLesson(payload);
      void navigate({ to: '/admin/lessons' });
    } catch {
      setNotice('API 연결 전이라 저장되지 않았습니다. 입력값은 그대로 남아 있습니다.');
    }
  }

  return (
    <section>
      <h3 className="text-[21px]">{id ? '문제 수정' : '문제 등록'}</h3>
      <p className="mb-5 text-sm text-muted">
        성취기준 코드는 shared 의 STANDARDS 에 등록된 값이어야 합니다.
      </p>

      <form className="panel grid gap-3.5 p-5 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <label className="lbl" htmlFor="title">
            미션 이름
          </label>
          <input
            id="title"
            className="field-input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="lbl" htmlFor="band">
            학년군
          </label>
          <select
            id="band"
            className="field-input"
            value={form.band}
            onChange={(e) => set('band', e.target.value as GradeBand)}
          >
            {(Object.keys(GRADE_BANDS) as GradeBand[]).map((key) => (
              <option key={key} value={key}>
                {GRADE_BANDS[key].label} · {GRADE_BANDS[key].subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl" htmlFor="concept">
            개념
          </label>
          <select
            id="concept"
            className="field-input"
            value={form.concept}
            onChange={(e) => set('concept', e.target.value as ConceptKey)}
          >
            {CONCEPT_ORDER.map((key) => (
              <option key={key} value={key}>
                {CONCEPTS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl" htmlFor="level">
            난이도
          </label>
          <select
            id="level"
            className="field-input"
            value={form.level}
            onChange={(e) => set('level', Number(e.target.value) as LessonLevel)}
          >
            {([1, 2, 3] as LessonLevel[]).map((lv) => (
              <option key={lv} value={lv}>
                {LEVELS[lv]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl" htmlFor="periods">
            차시
          </label>
          <input
            id="periods"
            type="number"
            min={1}
            max={12}
            className="field-input"
            value={form.periods}
            onChange={(e) => set('periods', Number(e.target.value))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="lbl" htmlFor="std">
            성취기준 코드
          </label>
          <input
            id="std"
            className="field-input"
            placeholder="[6실05-01]"
            value={form.standardCode}
            onChange={(e) => set('standardCode', e.target.value)}
          />
          <p className="mt-1.5 text-[12.5px] text-muted">비워 두면 ‘교과 외 준비 단계’로 분류됩니다.</p>
        </div>

        <div className="md:col-span-2">
          <label className="lbl" htmlFor="desc">
            문제 설명
          </label>
          <textarea
            id="desc"
            className="field-input min-h-[92px]"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="lbl" htmlFor="blocks">
            사용 블록 (쉼표로 구분)
          </label>
          <input
            id="blocks"
            className="field-input"
            placeholder="반복하기, 앞으로 가기, 방향 돌리기"
            value={form.blockLabels}
            onChange={(e) => set('blockLabels', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="lbl" htmlFor="stage">
            스테이지 설정
          </label>
          <input
            id="stage"
            className="field-input"
            value={form.stageNote}
            onChange={(e) => set('stageNote', e.target.value)}
          />
          {/* TODO: 격자를 클릭해 벽/목표를 찍는 스테이지 편집기로 교체 */}
          <p className="mt-1.5 text-[12.5px] text-muted">스테이지 편집기는 별도 화면에서 연결될 예정입니다.</p>
        </div>

        <div className="flex gap-2.5 md:col-span-2">
          <button type="submit" className="btn btn-primary">
            저장하기
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setForm(initialFor(id))}>
            초기화
          </button>
        </div>

        {notice && (
          <p className="rounded-[10px] border border-dashed border-line-strong bg-surface p-3 text-[13.5px] text-ink-soft md:col-span-2">
            {notice}
          </p>
        )}
      </form>
    </section>
  );
}
