import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SearchFilter() {
  const difficulties = [
    { id: 'all', label: '전체', color: 'gray' },
    { id: 'beginner', label: '초급', color: 'green' },
    { id: 'intermediate', label: '중급', color: 'yellow' },
    { id: 'advanced', label: '고급', color: 'red' },
  ];

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'basic', name: '기초' },
    { id: 'loops', name: '반복문' },
    { id: 'conditions', name: '조건문' },
    { id: 'functions', name: '함수' },
    { id: 'variables', name: '변수' },
    { id: 'challenge', name: '도전' },
  ];

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <span className="iconify-[fa--search] text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform"></span>
          <Input
            type="text"
            placeholder="문제 제목이나 태그로 검색..."
            className="pl-10"
          />
        </div>

        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="난이도" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem value={difficulty.id} key={difficulty.id}>
                {difficulty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-muted-foreground text-sm">
        총 {0}개의 문제를 찾았습니다
      </div>
    </div>
  );
}
