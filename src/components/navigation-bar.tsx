import { useEffect, useState, type JSX } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import mainLogo from '../assets/images/Logo/minilogo-bg-tp.png';
// import { useUserStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from './ui/navigation-menu';
import { useIsMobile } from '@/hooks/use-mobile';

// interface NavigationBarProps {
//   user: User | null; // 사용자 정보 (로그인 상태에 따라 null일 수 있음)
// }

// 2. 가짜 Supabase 객체는 완전히 삭제합니다.

export default function NavigationBar(): JSX.Element {
  const isMobile = useIsMobile();

  const isAppThemeDark = useThemeStore((state) => state.isAppThemeDark);
  const switchTheme = useThemeStore((state) => state.toggleAppTheme);

  const [isSwitchOn, setIsSwitchOn] = useState<boolean>(false);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  // const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  // const user = useUserStore((state) => state.user);
  // const signOut = useUserStore((state) => state.logout);
  const user = { user_metadata: { email: 'test@example.com' } }; // 임시 사용자 데이터
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // 임시로 로그인 상태를 설정

  const handleLogout = async (): Promise<void> => {
    // signOut();
    setIsLoggedIn(false); // 임시로 로그아웃 상태 변경
  };

  function getClassPrimaryMenuItem(isActive: boolean): string {
    const activeClass = isActive
      ? 'bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground focus:bg-primary/80 focus:text-primary-foreground outline-none'
      : '';
    return (
      'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium ' +
      activeClass
    );
  }

  useEffect(() => {
    setIsSwitchOn(isAppThemeDark);
  }, [isAppThemeDark]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath) {
      setActivePageId(currentPath);
    }
  }, []); // 컴포넌트 마운트 시에만 실행

  // 회원 버튼 (로그인 상태에 따라 드롭다운 또는 로그인 버튼 표시)
  const MemberBtn = (): JSX.Element => {
    if (!isLoggedIn) {
      return (
        <div className='relative'>
          <Button
            variant='outline'
            className='hover:bg-accent hover:text-accent-foreground flex items-center justify-center p-2 transition-colors duration-200'
            onClick={(): void => {
              // window.location.href = '/login';
              setIsLoggedIn(true); // 임시로 로그인 상태 변경
            }}
          >
            <span className='iconify-[solar--login-3-line-duotone] h-6 w-6' />
            로그인
          </Button>
        </div>
      );
    }
    return (
      // 로그인 상태일 때 드롭다운 메뉴를 표시합니다.
      <div className='relative'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className='h-8 w-8'>
              <AvatarFallback>
                <span className='iconify-[f7--person-circle] hover:text-muted-foreground h-8 w-8'></span>
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem disabled>{user?.user_metadata.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>회원정보</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <nav
      // Tailwind CSS
      // py-3: 상하 패딩
      className='bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'
    >
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        {/* 로고 영역 */}
        <a href='/' className='flex items-center space-x-2'>
          <img
            src={mainLogo}
            alt='Logo'
            className='h-12' // 로고 크기 설정
          />
          <span className='font-bungee bg-linear-to-r from-indigo-600 to-sky-600 bg-clip-text text-2xl font-bold text-transparent'>
            COBLOCKS
          </span>
        </a>

        {/* 중앙 네비게이션 메뉴 */}
        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList className='flex-wrap gap-2'>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/'
                className={`${getClassPrimaryMenuItem(activePageId === '/')} flex-row gap-2`}
              >
                <span className='iconify-[fa-solid--home] h-4 w-4'></span>홈
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/algorithm'
                className={`${getClassPrimaryMenuItem(activePageId === '/algorithm')} flex-row gap-2`}
              >
                <span className='iconify-[fa7-solid--puzzle-piece] h-4 w-4'></span>알고리즘
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href='/about'
                className={`${getClassPrimaryMenuItem(activePageId === '/about')} flex-row gap-2`}
              >
                <span className='iconify-[fa-solid--info-circle] h-4 w-4'></span>소개
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* 우측 메뉴 */}
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <span className='iconify-[humbleicons--sun] h-4 w-4' />
            <Switch
              id='theme-toggle'
              className='hover:cursor-pointer'
              checked={isSwitchOn}
              onCheckedChange={switchTheme}
            />
            <span className='iconify-[humbleicons--moon] h-4 w-4' />
          </div>

          <MemberBtn />
        </div>
      </div>
    </nav>
  );
}
