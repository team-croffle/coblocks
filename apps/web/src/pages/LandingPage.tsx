import { Link, useNavigate } from '@tanstack/react-router';
import { GRADE_BANDS, type GradeBand } from '@coblocks/shared';
import { useAuthStore } from '@/stores/auth';
import { ThemeToggle } from '@/components/ThemeToggle';

const STEPS = [
  {
    n: 'STEP 1',
    t: '블록으로 만든다',
    d: '문법 오류 없이 논리에만 집중합니다. 블록의 색이 곧 개념의 색이라, 무엇을 쓰고 있는지 눈으로 구분됩니다.',
  },
  {
    n: 'STEP 2',
    t: '흐름을 말로 옮긴다',
    d: '순서도와 의사코드로 자기 프로그램을 설명합니다. 추상화와 문제 분해가 이 단계에서 만들어집니다.',
  },
  {
    n: 'STEP 3',
    t: '텍스트 코드로 건넌다',
    d: '중학교 후반부터 같은 블록 구조를 파이썬 코드와 나란히 보여 줍니다. 옮겨 적는 경험이 됩니다.',
  },
];

const ROADMAP: Array<{ band: GradeBand; name: string; desc: string; cssVar: string; std: string }> = [
  {
    band: 'e34',
    name: '놀이로 만나기',
    desc: '순서 카드, 미로 놀이, 규칙 찾기. 컴퓨터 없이 순차·반복의 감각을 먼저 만듭니다.',
    cssVar: '--color-seq',
    std: '교과 외 준비 단계',
  },
  {
    band: 'e56',
    name: '블록으로 만들기',
    desc: '생활 속 문제를 알고리즘으로 표현하고, 블록으로 프로그램을 만들어 친구와 공유합니다.',
    cssVar: '--color-loop',
    std: '[6실05-01~03]',
  },
  {
    band: 'm',
    name: '구조로 다루기',
    desc: '추상화, 중첩 제어, 함수, 순차 자료구조. 블록과 텍스트 코드를 나란히 씁니다.',
    cssVar: '--color-data',
    std: '[9정03-01~09]',
  },
  {
    band: 'h',
    name: '코드로 넘어가기',
    desc: '정렬·탐색 알고리즘의 효율을 비교하고, 다차원 자료구조와 클래스를 다룹니다.',
    cssVar: '--color-func',
    std: '[12정03-01~10]',
  },
];

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  /** 비로그인 상태면 로그인을 거쳐 커리큘럼으로 보낸다. */
  function goLearn() {
    if (user) void navigate({ to: '/app/curriculum' });
    else void navigate({ to: '/login', search: { redirect: '/app/curriculum' } });
  }

  return (
    <div>
      <nav className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3.5 px-6 py-3">
          <span className="flex items-center gap-2.5 font-display text-[19px]">
            <span className="h-6 w-6 rounded-lg bg-seq" aria-hidden="true" />
            Coblocks
          </span>
          <span className="flex-1" />
          <a href="#how" className="hidden text-sm text-muted sm:inline">
            학습 방식
          </a>
          <a href="#road" className="hidden text-sm text-muted sm:inline">
            학년 로드맵
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="rounded-[10px] border border-line-strong px-4 py-2 text-sm font-semibold"
            onClick={goLearn}
          >
            학습하기
          </button>
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className="rounded-[10px] border border-line-strong px-4 py-2 text-sm font-semibold"
          >
            로그인
          </Link>
        </div>
      </nav>

      <header className="border-b border-line py-16">
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-6 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <span className="mb-5 inline-flex items-center rounded-full border border-line bg-brand-soft px-3 py-1 text-[12.5px] tracking-wide text-brand">
              2022 개정 교육과정 · 실과(정보) · 정보
            </span>
            <h1 className="mb-4 text-[clamp(32px,4.6vw,52px)] leading-tight">
              블록을 쌓다 보면
              <br />
              <em
                className="not-italic"
                style={{ background: 'linear-gradient(transparent 62%, var(--color-accent) 62%)' }}
              >
                알고리즘이 보입니다
              </em>
            </h1>
            <p className="mb-7 max-w-[34em] text-[17px] text-ink-soft">
              초등 3학년의 언플러그드 놀이부터 고등학교의 정렬·탐색 알고리즘까지. 블록코딩으로 시작해 텍스트 코드로
              건너가는 한 줄기 학습 경로를, 교육과정 성취기준에 그대로 맞춰 설계했습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={goLearn}>
                학습 시작하기
              </button>
              <a href="#road" className="btn btn-ghost">
                학년별 로드맵 보기
              </a>
            </div>
          </div>

          <div>
            <div className="flex flex-col items-start" aria-hidden="true">
              <div className="mb-1.5 min-w-[250px] rounded-[10px] bg-seq px-5 py-3 text-[14.5px] font-semibold text-white">
                시작하면
              </div>
              <div className="mb-1.5 ml-6 min-w-[228px] rounded-[10px] bg-loop px-5 py-3 text-[14.5px] font-semibold text-white">
                4번 반복하기
              </div>
              <div className="mb-1.5 ml-11 min-w-[206px] rounded-[10px] bg-cond px-5 py-3 text-[14.5px] font-semibold text-white">
                벽에 닿았다면
              </div>
              <div className="ml-11 min-w-[206px] rounded-[10px] bg-data px-5 py-3 text-[14.5px] font-semibold text-white">
                방향을 90도 돌리기
              </div>
            </div>
            <p className="mt-4 font-mono text-[13px] text-muted">// 정사각형 그리기 — 반복 × 조건의 첫 만남</p>
          </div>
        </div>
      </header>

      <section id="how" className="border-b border-line py-14">
        <div className="mx-auto max-w-[1180px] px-6">
          <h2 className="mb-2 text-[clamp(24px,3vw,31px)]">블록에서 코드로, 세 걸음</h2>
          <p className="mb-8 max-w-[46em] text-muted">
            같은 문제를 세 번 만납니다. 블록으로 만들고, 흐름을 말로 설명하고, 마지막에 텍스트 코드로 옮깁니다.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border-l-2 border-line pl-4">
                <div className="mono tracking-widest text-muted">{s.n}</div>
                <h3 className="mt-1.5 mb-2 text-[19px]">{s.t}</h3>
                <p className="text-[14.5px] text-ink-soft">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="road" className="bg-surface py-14">
        <div className="mx-auto max-w-[1180px] px-6">
          <h2 className="mb-2 text-[clamp(24px,3vw,31px)]">학년 로드맵</h2>
          <p className="mb-8 max-w-[46em] text-muted">
            정보 교육은 초등 5~6학년 실과 34시간, 중학교 정보 68시간 이상으로 편성됩니다.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((r) => (
              <div
                key={r.band}
                className="flex flex-col gap-2.5 rounded-card border border-line bg-paper p-5"
                style={{ borderTop: `4px solid var(${r.cssVar})` }}
              >
                <div className="font-display text-[18px]">{r.name}</div>
                <div className="mono text-muted">
                  {GRADE_BANDS[r.band].label} · {GRADE_BANDS[r.band].subject}
                </div>
                <p className="flex-1 text-sm text-ink-soft">{r.desc}</p>
                <div className="flex flex-wrap gap-2 border-t border-dashed border-line pt-2.5 text-xs text-muted">
                  <span className="rounded-md bg-surface-2 px-2 py-0.5">{GRADE_BANDS[r.band].hours}</span>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5">{r.std}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1180px] px-6 py-10 text-[13px] text-muted">
        Coblocks · 초·중·고 블록코딩 알고리즘 학습 서비스
      </footer>
    </div>
  );
}
