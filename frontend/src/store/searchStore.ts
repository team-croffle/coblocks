import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AlgorithmProblem } from './searchStore.type';
import mockData from '@/data/mock/problem.mock.json';

interface AlgorithmProblemList {
  algorithmProblems: AlgorithmProblem[];
  updateProblems: () => Promise<void>;
}

export const useAlgorithmSearchStore = create(
  immer<AlgorithmProblemList>((set) => {
    return {
      algorithmProblems: [],
      updateProblems: async () => {
        // fetch('@/data/mock/problem.mock.json')
        // .then((resp) => {
        //   return resp.json();
        // })
        // .then((data) => {
        //   set((state) => {
        //     state.algorithmProblems = data;
        //   });
        // })
        // .catch((err) => {
        //   console.error('Failed to fetch algorithm problems:', err);
        // });
        set((state) => {
          state.algorithmProblems = mockData as AlgorithmProblem[];
        });
      },
    };
  }),
);
