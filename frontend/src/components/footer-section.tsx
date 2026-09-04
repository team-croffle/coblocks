import type { JSX } from 'react';
import logoSrc from '@/assets/images/Logo/minilogo-bg-tp.png';
import { Separator } from '@/components/ui/separator';

export default function Footer(): JSX.Element {
  // const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-background/95 supports-backdrop-filter:bg-background/60 border-t backdrop-blur'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {/* 브랜드 섹션 */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <div className='flex h-8 w-8 items-center justify-center'>
                <img src={logoSrc} alt='Coblocks Logo' />
              </div>
              <span className='text-primary text-xl font-bold'>Coblocks</span>
            </div>
            <p className='text-muted-foreground text-sm'>
              초·중·고 학생들을 위한 블록코딩 교육 플랫폼입니다. 더 쉽고, 직관적이며, 재미있게
              알고리즘을 배우고, 문제를 해결해보세요!
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className='mb-4'>빠른 링크</h4>
            <ul className='space-y-2 text-sm'>
              <li>
                <a
                  href='/'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  홈
                </a>
              </li>
              <li>
                <a
                  href='/algorithm'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  알고리즘 문제
                </a>
              </li>
              <li>
                <a
                  href='/about'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href='/login'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  로그인
                </a>
              </li>
            </ul>
          </div>

          {/* 학습 자료 */}
          {/* <div>
        <h4 className="mb-4">학습 자료</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="text-muted-foreground">블록코딩 기초</span>
          </li>
          <li>
            <span className="text-muted-foreground">알고리즘 개념</span>
          </li>
          <li>
            <span className="text-muted-foreground">문제해결 전략</span>
          </li>
          <li>
            <span className="text-muted-foreground">학습 가이드</span>
          </li>
        </ul>
      </div> */}

          {/* 연락처 */}
          <div>
            <h4 className='mb-4'>연락처</h4>
            <ul className='space-y-2 text-sm'>
              <li className='text-muted-foreground flex items-center space-x-2'>
                <span className='iconify-[ic--outline-mail]'></span>
                <span>support@croffledev.kr</span>
              </li>
              <li className='text-muted-foreground flex items-center space-x-2'>
                <span className='iconify-[line-md--github-loop]'></span>
                <a
                  href='https://github.com/Team-Croffle'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-foreground transition-colors'
                >
                  GitHub: Team-Croffle (link)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className='my-6 bg-neutral-300 dark:bg-neutral-700' />
        {/* <div className='bg-border my-6 h-px w-full shrink-0'></div> */}

        <div className='flex flex-col items-center justify-center md:flex-row'>
          <div className='text-muted-foreground mb-4 text-sm md:mb-0'>
            © 2024 Croffle Dev. All rights reserved.
          </div>
          {/* <div className="flex space-x-4 text-sm">
        <span
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          개인정보처리방침
        </span>
        <span
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          이용약관
        </span>
      </div> */}
        </div>
      </div>
    </footer>
  );
}
