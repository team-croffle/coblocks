export interface AlgorithmProblem {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  timeEstimate: string;
  completedBy: number;
  rating: number;
  tags: string[];
  icon: string;
  color: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}
