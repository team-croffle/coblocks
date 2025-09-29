import { createFileRoute } from '@tanstack/react-router';
import ProblemStatus from '@/components/problem-status';
import SearchFilter from '@/components/search-filter';

export const Route = createFileRoute('/algorithm/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <section className='min-h-screen py-8'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <h1 className='mb-4 text-3xl font-bold md:text-4xl'>
              <span className='bg-linear-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-sky-400'>
                알고리즘 문제 풀기
              </span>
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
              블록코딩으로 다양한 알고리즘 문제를 풀어보세요. 단계적 학습을 통해 문제 해결 능력을
              키울 수 있습니다.
            </p>
          </div>
          <SearchFilter />
          <ProblemStatus />
        </div>
      </section>
    </>
  );
}
