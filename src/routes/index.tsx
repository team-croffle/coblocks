import mainlogo from '@/assets/images/Logo/mainlogo-bg-tp.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mainFeatures } from '@/data/mainFeatures';
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-linear-to-br from-purple-100 via-blue-100 to-sky-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-sky-900/30'>
        <div className='container mx-auto px-4 py-20'>
          {/* Hero Content Layout */}
          <div className='grid items-center gap-12 lg:grid-cols-2'>
            {/* main content */}
            <div className='space-y-8'>
              {/* Text Content */}
              <div className='space-y-4'>
                <Badge className='border-0 bg-linear-to-r from-indigo-700 via-blue-600 to-sky-500 text-white'>
                  새로운 학습 경험을 위한
                </Badge>
                <h1 className='text-4xl font-bold md:text-6xl'>
                  <span className='from-foreground bg-linear-to-r to-blue-500 bg-clip-text text-transparent dark:to-blue-400'>
                    블록으로 배우는
                  </span>
                  <br />
                  <span className='text-foreground'>알고리즘!</span>
                </h1>
                <p className='text-muted-foreground max-w-lg text-xl'>
                  복잡한 코드 대신 블록을 조합해 프로그래밍을 배워보세요. 알고리즘을 배우며 컴퓨팅적
                  사고력을 키우고, 시각적으로 이해할 수 있어요. 초등학생부터 고등학생까지, 누구나
                  쉽고 재미있게 시작하세요.
                </p>
              </div>
              {/* Button Section */}
              <div>
                <Button
                  size='lg'
                  className='bg-linear-to-r from-indigo-600 to-sky-600 pl-4 text-white transition-transform duration-300 hover:scale-105 hover:from-indigo-700 hover:to-sky-700 dark:from-indigo-500 dark:to-sky-500 dark:hover:from-indigo-600 dark:hover:to-sky-600'
                >
                  <span className='iconify-[fluent--play-32-regular] h-6 w-6'></span>
                  지금 시작하기
                </Button>
              </div>
            </div>
            {/* image || banner */}
            <div>
              <div>
                <img src={mainlogo} alt='Hero Banner' />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Feature Section */}
      <section className='py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
              왜
              <span className='bg-linear-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent'>
                COBLOCKS
              </span>
              인가요?
            </h2>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
              Coblocks는 블록 기반 프로그래밍을 통해 알고리즘과 컴퓨팅적 사고력을 쉽게 배울 수
              있도록 설계된 교육 플랫폼입니다.
            </p>
          </div>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {mainFeatures.map((feature) => (
              <Card className='relative overflow-hidden border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:shadow-neutral-700'>
                <CardHeader className='pb-4'>
                  <div
                    className={`h-12 w-12 rounded-lg bg-linear-to-r ${feature.color} mb-4 flex items-center justify-center`}
                  >
                    <span className={`${feature.icon} h-6 w-6 text-white`} />
                  </div>
                  <CardTitle className='text-lg'>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-base'>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className='bg-linear-to-br from-purple-100 via-blue-100 to-sky-100 py-20 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-sky-900/30'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-6 text-3xl font-bold md:text-4xl'>지금 바로 시작해보세요!</h2>
          <p className='mx-auto mb-8 max-w-2xl text-xl opacity-90'>
            회원가입 후 바로 무료로 블록 코딩을 체험할 수 있어요. 다양한 알고리즘 문제를 블록으로
            해결하며 프로그래밍의 재미를 느껴보세요.
          </p>
          <Button
            size='lg'
            variant='secondary'
            className='text-text-purple-600 bg-white text-black transition-transform duration-300 hover:scale-105 hover:bg-neutral-200'
          >
            무료로 시작하기
            <span className='iconify-[line-md--arrow-right] h-6 w-6'></span>
          </Button>
        </div>
      </section>
    </>
  );
}
