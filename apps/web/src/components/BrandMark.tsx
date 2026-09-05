import logoUrl from '@/assets/logo.svg';

interface Props {
  /** 픽셀 단위 한 변 길이. 기본은 헤더에서 쓰는 24px. */
  size?: number;
}

/**
 * 서비스 로고. 브랜드 표시는 이 컴포넌트 하나만 쓴다 —
 * 화면마다 따로 그리면 로고를 바꿀 때 빠지는 곳이 생긴다.
 */
export function BrandMark({ size = 24 }: Props) {
  return (
    <img src={logoUrl} alt='' aria-hidden='true' width={size} height={size} className='shrink-0' />
  );
}
