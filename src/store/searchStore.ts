import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AlgorithmProblem } from './searchStore.type';

interface AlgorithmProblemList {
  algorithmProblems: AlgorithmProblem[];
  updateProblems: () => Promise<void>;
}

export const useAlgorithmSearchStore = create(
  immer<AlgorithmProblemList>((set) => {
    return {
      algorithmProblems: [],
      updateProblems: async () => {
        fetch('https://my-json-server.typicode.com/Team-Croffle/coblocks-mock-api/algorithmList')
          .then((resp) => {
            return resp.json();
          })
          .then((data) => {
            set((state) => {
              state.algorithmProblems = data;
            });
          })
          .catch((err) => {
            console.error('Failed to fetch algorithm problems:', err);
          });
      },
    };
  }),
);
