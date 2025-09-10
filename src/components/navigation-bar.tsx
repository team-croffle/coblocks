import { useEffect, useState, type JSX } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import mainLogo from '../assets/images/Logo/minilogo-bg-tp.png';
// import { useUserStore } from '@/store/userStore';
import { useNavStore } from '@/store/navStore';
import { useThemeStore } from '@/store/themeStore';

// interface NavigationBarProps {
//   user: User | null; // 사용자 정보 (로그인 상태에 따라 null일 수 있음)
// }

// 2. 가짜 Supabase 객체는 완전히 삭제합니다.

export default function NavigationBar(): JSX.Element {
  const isAppThemeDark = useThemeStore((state) => state.isAppThemeDark);
  const switchTheme = useThemeStore((state) => state.toggleAppTheme);
  const [isSwitchOn, setIsSwitchOn] = useState<boolean>(false);

  const navMenuItem = useNavStore((state) => state);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState<boolean>(false); // 네비게이션 바 확장 상태

  const [activePageId, setActivePageId] = useState<string | null>(null);

  // const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  // const user = useUserStore((state) => state.user);
  // const signOut = useUserStore((state) => state.logout);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // 임시로 로그인 상태를 설정
  const user = { user_metadata: { email: 'test@example.com' } }; // 임시 사용자 데이터

  const handleLogout = async (): Promise<void> => {
    // signOut();
    setIsNavbarExpanded(false); // 로그아웃 후 네비게이션 바 닫기
    setIsLoggedIn(false); // 임시로 로그아웃 상태 변경
  };

  // useEffect(() => {
  //   console.log(navMenuItem);
  //   console.log($isLoggedIn);
  //   console.log(isThemeDark);
  // }, [navMenuItem]);

  useEffect(() => {
    setIsSwitchOn(isAppThemeDark);
  }, [isAppThemeDark]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentPage = navMenuItem.find((item) => item.link === currentPath);
    if (currentPage) {
      setActivePageId(currentPage.id);
    }
  }, []); // 컴포넌트 마운트 시에만 실행

  // 회원 버튼 (로그인 상태에 따라 드롭다운 또는 로그인 버튼 표시)
  const MemberBtn = (): JSX.Element => {
    if (!isLoggedIn) {
      return (
        <div className='relative'>
          <Button
            variant='outline'
            className='flex items-center justify-center p-2 transition-colors duration-200 hover:opacity-50'
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
        {/* 드롭다운 위치 지정을 위한 relative */}
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center justify-center p-2 transition-colors duration-200 hover:opacity-50'
          onClick={(): void => {
            // 드롭다운 메뉴의 확장 상태는 isNavbarExpanded와 별도로 관리할 수 있습니다.
            // 여기서는 기존 로직 유지를 위해 isNavbarExpanded를 그대로 사용합니다.
            setIsNavbarExpanded(!isNavbarExpanded);
          }}
          aria-expanded={isNavbarExpanded}
          aria-haspopup='true'
        >
          <Avatar className='h-8 w-8'>
            <AvatarFallback>
              <span className='iconify-[f7--person-circle] h-8 w-8'></span>
            </AvatarFallback>
          </Avatar>
        </Button>
        {isNavbarExpanded && ( // isNavbarExpanded 상태에 따라 드롭다운 메뉴 표시
          <div className='absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg dark:bg-neutral-800 dark:text-white'>
            <div className='block px-4 py-2 text-left text-sm whitespace-pre-wrap'>
              {user?.user_metadata.email || '이메일 없음'}
            </div>
            <a
              href='/profile'
              className='block rounded-md px-4 py-2 text-sm hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-700'
            >
              회원정보
            </a>
            <Button
              variant='secondary'
              onClick={(): void => {
                handleLogout();
              }}
              className='block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700'
            >
              로그아웃
            </Button>
          </div>
        )}
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

        <div id='basic-navbar-nav' className='hidden items-center space-x-1 md:flex'>
          {navMenuItem.map((item) => (
            <Button
              key={item.id}
              variant={activePageId === item.id ? 'default' : 'ghost'}
              size='sm'
              onClick={(): void => {
                if (activePageId === item.id) return;
                window.location.href = item.link;
              }}
              className='flex items-center space-x-2'
            >
              <span className={`${item.icon} h-4 w-4`}></span>
              {item.label}
            </Button>
          ))}
        </div>

        {/* 우측 메뉴 */}
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2'>
            <span className='iconify-[humbleicons--sun] h-4 w-4' />
            <Switch id='theme-toggle' checked={isSwitchOn} onCheckedChange={switchTheme} />
            <span className='iconify-[humbleicons--moon] h-4 w-4' />
          </div>

          <MemberBtn />
        </div>
      </div>
    </nav>
  );
}
