import type { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '../ui/item';
import type { AlgorithmProblem } from '@/store/searchStore.type';
import { Button } from '../ui/button';
import { CheckCircle, Circle, Play } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Badge } from '../ui/badge';

interface ProblemListProps {
  filteredProblems: AlgorithmProblem[];
}

export const ProblemList = ({ filteredProblems }: ProblemListProps): JSX.Element => {
  return (
    <Tabs defaultValue='all' className='space-y-6'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='all'>전체 문제</TabsTrigger>
        <TabsTrigger value='solved'>푼 문제</TabsTrigger>
        <TabsTrigger value='unsolved'>안 푼 문제</TabsTrigger>
      </TabsList>

      <TabsContent value='all' className='space-y-4'>
        <div className='text-muted-foreground text-sm'>
          {`총 ${filteredProblems.length}개의 문제`}
        </div>
        <div className='grid gap-4'>
          {filteredProblems.map((problem) => (
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
      </TabsContent>
    </Tabs>
  );
};
