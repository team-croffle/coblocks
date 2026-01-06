type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export const difficultyLabelConverter = (level: DifficultyLevel): string => {
  switch (level) {
    case 'beginner':
      return '초급';
    case 'intermediate':
      return '중급';
    case 'advanced':
      return '고급';
    default:
      return '알 수 없음';
  }
};

export const difficultyColorConverter = (level: DifficultyLevel): string => {
  switch (level) {
    case 'beginner':
      return 'bg-green-600 text-white font-bold dark:bg-green-800';
    case 'intermediate':
      return 'bg-amber-600 text-white font-bold dark:bg-amber-800';
    case 'advanced':
      return 'bg-red-600 text-white font-bold dark:bg-red-800';
    default:
      return 'bg-neutral-600 text-white font-bold dark:bg-neutral-800';
  }
};
