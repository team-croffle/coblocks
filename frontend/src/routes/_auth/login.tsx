import { createFileRoute, Link } from '@tanstack/react-router';
import mainLogo from '../../assets/images/Logo/minilogo-bg-tp.png';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className='bg-muted/30 flex min-h-screen items-center justify-center px-4 py-12'>
      <div>
        <div>
          <Link to='/' className='flex items-center space-x-2'>
            <img
              src={mainLogo}
              alt='Logo'
              className='h-16' // 로고 크기 설정
            />
            <span className='font-bungee bg-linear-to-r from-indigo-600 to-sky-600 bg-clip-text text-3xl font-bold text-transparent'>
              COBLOCKS
            </span>
          </Link>
          <h1>환영합니다!</h1>
          <p>블록코딩과 함께 프로그래밍을 배워보세요</p>
        </div>

        <Tabs defaultValue='login'>
          <TabsList>
            <TabsTrigger value='login'>로그인</TabsTrigger>
            <TabsTrigger value='register'>회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value='login'>
            <Card>
              <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>기존 계정으로 로그인하세요.</CardDescription>
              </CardHeader>
              <CardContent>{/* 로그인 폼*/}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='register'>
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>새 계정을 만들어보세요.</CardDescription>
              </CardHeader>
              <CardContent>{/* 회원가입 폼*/}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
