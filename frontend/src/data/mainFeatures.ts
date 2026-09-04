interface HomepageFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export const mainFeatures: HomepageFeature[] = [
  {
    icon: 'iconify-[humbleicons--code]',
    title: '블록코딩',
    description: '드래그 앤 드롭 방식의 블록코딩으로 쉽게 프로그래밍을 배워보세요.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: 'iconify-[lucide--puzzle]',
    title: '단계별 학습',
    description: '기초부터 고급까지, 자신의 수준에 맞는 문제들을 풀어보세요.',
    color: 'from-pink-600 to-rose-400',
  },
  {
    icon: 'iconify-[solar--gamepad-linear]',
    title: '게임형 학습',
    description: '게임처럼 눈으로 보고 움직이며 재밌고 자연스럽게 프로그래밍을 익혀보세요.',
    color: 'from-green-600 to-emerald-400',
  },
  {
    icon: 'iconify-[lucide--trophy]',
    title: '성취감과 보상',
    description: '문제를 해결할 때마다 배지와 포인트를 획득하며 성취감을 느껴보세요.',
    color: 'from-purple-500 to-indigo-400',
  },
];
