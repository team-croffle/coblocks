import { type JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item';
import type { AlgorithmProblem } from '@/store/searchStore.type';
import { Button } from '../ui/button';
import { CheckCircle, Circle, Play } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface ProblemListProps {
  filteredProblems: AlgorithmProblem[];
}

export const ProblemList = ({ filteredProblems }: ProblemListProps): JSX.Element => {
  const ListContents = (tabValue: string): JSX.Element => {
    const filteredByTab = filteredProblems.filter((problem) => {
      if (tabValue === 'solved') return problem.isCompleted;
      if (tabValue === 'unsolved') return !problem.isCompleted;
      return true;
    });

    return (
      <>
        <div className='text-muted-foreground text-sm'>{`총 ${filteredByTab.length}개의 문제`}</div>
        <div className='grid gap-4'>
          {filteredByTab.map((problem) => (
            <Item key={problem.id} variant='outline'>
              <ItemMedia>
                {problem.isCompleted ? (
                  <CheckCircle className='h-6 w-6 text-green-600' />
                ) : (
                  <Circle className='text-muted-foreground h-6 w-6' />
                )}
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-lg'>{problem.title}</ItemTitle>
                <ItemDescription className='mt-1'>{problem.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant='default' asChild>
                  <Link to={`/algorithm/problem/${problem.id}`}>
                    <Play className='mr-2 h-4 w-4' />
                    {problem.isCompleted ? '다시 풀기' : '문제 풀기'}
                  </Link>
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      </>
    );
  };

  return (
    <Tabs defaultValue='all' className='space-y-6'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='all'>전체 문제</TabsTrigger>
        <TabsTrigger value='solved'>푼 문제</TabsTrigger>
        <TabsTrigger value='unsolved'>안 푼 문제</TabsTrigger>
      </TabsList>

      <TabsContent value='all' className='space-y-4'>
        {ListContents('all')}
      </TabsContent>
      <TabsContent value='solved' className='space-y-4'>
        {ListContents('solved')}
      </TabsContent>
      <TabsContent value='unsolved' className='space-y-4'>
        {ListContents('unsolved')}
      </TabsContent>
    </Tabs>
  );
};
