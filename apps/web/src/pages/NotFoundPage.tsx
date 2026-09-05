import { Link } from '@tanstack/react-router';

export function NotFoundPage() {
  return (
    <div className='mx-auto max-w-[600px] px-6 py-24 text-center'>
      <h1 className='mb-3 text-3xl'>찾는 페이지가 없어요</h1>
      <p className='mb-6 text-muted'>주소를 다시 확인해 주세요.</p>
      <Link to='/' className='btn btn-primary'>
        홈으로
      </Link>
    </div>
  );
}
