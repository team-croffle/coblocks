import { useEffect, useState, type JSX } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/utils/supabase';
import type { User } from '@supabase/supabase-js';
import mainLogo from '../assets/images/Logo/minilogo-bg-tp.png';

// interface NavigationBarProps {
//   user: User | null; // 사용자 정보 (로그인 상태에 따라 null일 수 있음)
// }

// 2. 가짜 Supabase 객체는 완전히 삭제합니다.

export default function NavigationBar(): JSX.Element {
  // 로그인 상태와 사용자 정보를 관리하는 상태 변수
  const [user, setUser] = useState<User | null>(null);
  // 모바일 햄버거 메뉴 확장 상태를 관리하는 상태 변수
  const [isNavbarExpanded, setIsNavbarExpanded] = useState<boolean>(false);

  // 컴포넌트가 마운트될 때, 그리고 인증 상태가 변경될 때 실행되는 효과 훅
  useEffect(() => {
    // 페이지 로드 시 현재 세션을 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Supabase 인증 상태 변경을 구독
    // 사용자가 로그인하거나 로그아웃할 때마다 이 콜백 함수가 실행
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 컴포넌트가 언마운트될 때 인증 상태 구독을 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut(); // Supabase 로그아웃 요청
    if (error) {
      console.error('로그아웃 오류:', error);
    }
    // 상태는 onAuthStateChange가 자동으로 업데이트합니다.
  };

  // 회원 버튼 (로그인 상태에 따라 드롭다운 또는 로그인 버튼 표시)
  const memberBtn = (): JSX.Element => {
    // 👈 3. isLoggedIn 대신 user 객체의 존재 여부로 상태를 확인합니다.
    if (user) {
      return (
        // 로그인 상태일 때 드롭다운 메뉴를 표시합니다.
        <div className='relative'>
          {' '}
          {/* 드롭다운 위치 지정을 위한 relative */}
          <button
            className='flex h-12 w-12 items-center justify-center rounded-full border-2 border-white p-2 text-2xl text-white transition-colors duration-200 hover:bg-white/20'
            onClick={(): void => {
              // 드롭다운 메뉴의 확장 상태는 isNavbarExpanded와 별도로 관리할 수 있습니다.
              // 여기서는 기존 로직 유지를 위해 isNavbarExpanded를 그대로 사용합니다.
              setIsNavbarExpanded(!isNavbarExpanded);
            }}
            aria-expanded={isNavbarExpanded}
            aria-haspopup='true'
          >
            <span className='iconify=[ant-design--user-outlined] h-6 w-6'></span>
          </button>
          {isNavbarExpanded && ( // isNavbarExpanded 상태에 따라 드롭다운 메뉴 표시
            <div className='absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg'>
              <div className='block px-4 py-2 text-left text-sm whitespace-pre-wrap text-gray-700'>
                {user.email || '이메일 없음'}
              </div>
              <Link
                to='/profile'
                className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              >
                회원정보
              </Link>
              <button
                onClick={handleLogout}
                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      );
    }
    // 로그인 상태가 아닐 때 로그인 버튼을 표시합니다.
    return (
      <Link to='/login'>
        <button className='flex h-12 w-12 items-center justify-center rounded-full border-2 border-white p-2 text-2xl text-white transition-colors duration-200 hover:bg-white/20'>
          <span className='iconify=[ant-design--user-outlined] h-6 w-6'></span>
        </button>
      </Link>
    );
  };

  return (
    <nav
      // Tailwind CSS
      // py-3: 상하 패딩
      className='relative z-40 h-24 bg-[#5193d9] py-3 shadow' // 다른 요소 위에 표시
    >
      <div className='container mx-auto flex h-full items-center justify-between px-4'>
        {' '}
        {/* 모바일 메뉴 토글 버튼 */}
        <button
          className='text-3xl text-white focus:outline-none lg:hidden' // 큰 화면에서는 숨김
          onClick={(): void => {
            setIsNavbarExpanded(!isNavbarExpanded);
          }}
          aria-controls='basic-navbar-nav'
          aria-expanded={isNavbarExpanded}
        >
          &#9776; {/* 메뉴 토글 */}
        </button>
        {/* 로고 영역 */}
        <Link to='/' className='mr-3 shrink-0 rounded px-2 py-1 text-white'>
          <img
            src={mainLogo}
            alt='Logo'
            className='h-16' // 로고 크기 설정
          />
        </Link>
        {/* 모바일에서만 보이는 회원 버튼 */}
        <div className='lg:hidden'>{memberBtn()}</div>
        {/* 네비게이션 메뉴 (모바일에서는 숨겨지고, 메뉴 클릭 시 토글) */}
        <div
          id='basic-navbar-nav'
          className={`lg:flex lg:grow lg:items-center lg:justify-between ${
            isNavbarExpanded
              ? 'absolute top-24 left-0 block w-full bg-[#5193d9] py-4 shadow-lg lg:relative lg:top-auto lg:py-0 lg:shadow-none'
              : 'hidden'
          }`}
          // 모바일에서 확장 시 전체 너비, 배경색, 그림자 추가
        >
          <div className='flex flex-col lg:ml-auto lg:flex-row'>
            {' '}
            <Link
              to='/'
              className='mr-2 mb-2 flex items-center rounded-md border-2 border-white px-3 py-2 text-white transition-colors duration-200 hover:bg-white/20 lg:mb-0' // 모바일에서 마진 추가
              onClick={(): void => {
                setIsNavbarExpanded(false);
              }}
            >
              <span className='iconify-[ant-design--home-filled] mr-1 text-xl'></span> 홈
            </Link>
            <Link
              to='/classroomSetup'
              className='mr-2 flex items-center rounded-md border-2 border-white px-3 py-2 text-white transition-colors duration-200 hover:bg-white/20'
              onClick={(): void => {
                setIsNavbarExpanded(false);
              }}
            >
              <span className='iconify-[fa-solid--school] mr-1 h-6 w-5'></span>
              강의실
            </Link>
          </div>

          {/* 데스크탑에서만 보이는 회원 버튼 (메뉴 오른쪽) */}
          <div className='ml-auto hidden items-center lg:flex'>{memberBtn()}</div>
        </div>
      </div>
    </nav>
  );
}
