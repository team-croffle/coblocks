import { Card, CardContent } from '@/components/ui/card';
import { useAlgorithmSearchStore } from '@/store/searchStore';
import { useEffect, useState } from 'react';
import { Spinner } from './ui/spinner';

export default function ProblemStatus() {
  const problems = useAlgorithmSearchStore((state) => state.algorithmProblems);
  const updateProblems = useAlgorithmSearchStore((state) => state.updateProblems);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    updateProblems().then(() => setIsLoading(false));
  }, [updateProblems]);

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      <Card>
        <CardContent className='pt-6 text-center'>
          {isLoading ? (
            <div className='mb-6 flex items-center justify-center'>
              <Spinner />
            </div>
          ) : (
            <>
              <div className='text-primary text-2xl font-bold'>{problems.length}</div>
              <div className='text-muted-foreground text-sm'>전체 문제</div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className='pt-6 text-center'>
          {isLoading ? (
            <div className='mb-6 flex items-center justify-center'>
              <Spinner />
            </div>
          ) : (
            <>
              <div className='text-2xl font-bold text-green-600'>
                {problems.filter((problem) => problem.isCompleted).length}
              </div>
              <div className='text-muted-foreground text-sm'>해결한 문제</div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className='pt-6 text-center'>
          {isLoading ? (
            <div className='mb-6 flex items-center justify-center'>
              <Spinner />
            </div>
          ) : (
            <>
              <div className='text-2xl font-bold text-orange-600'>
                {Math.round(
                  (problems.filter((problem) => problem.isCompleted).length / problems.length) *
                    100,
                ) || 0}
                %
              </div>
              <div className='text-muted-foreground text-sm'>해결 진행도</div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className='pt-6 text-center'>
          {isLoading ? (
            <div className='mb-6 flex items-center justify-center'>
              <Spinner />
            </div>
          ) : (
            <>
              <div className='text-2xl font-bold text-sky-600'>{0}</div>
              <div className='text-muted-foreground text-sm'>획득한 포인트</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
