import { Action, action, Thunk, thunk } from 'easy-peasy';

import type { IStoreInjections } from '../../store';
import { dispatchSetLoading } from '../../loading/loading.store';

export interface IRunbookListStore {
  runbooks: {
    lastRun: string | null;
    id: number;
    name: string;
    description: string;
  }[];
  isPopulateCompleted: boolean;

  set: Action<
    IRunbookListStore,
    {
      runbooks: {
        id: number;
        name: string;
        description: string;
        lastRun: string | null;
      }[];
    }
  >;
  setIsPopulateCompleted: Action<IRunbookListStore, { complete: boolean }>;

  populate: Thunk<IRunbookListStore, void, IStoreInjections>;
}

export const runbooksListStore: IRunbookListStore = {
  runbooks: [],
  isPopulateCompleted: false,

  set: action((state, { runbooks }) => {
    state.runbooks = [...runbooks];
  }),

  setIsPopulateCompleted: action((state, { complete }) => {
    state.isPopulateCompleted = complete;
  }),

  populate: thunk(
    async (actions, _, { injections: { runbooksService }, dispatch }) => {
      dispatchSetLoading(dispatch, true);

      try {
        const { runbooks } = await runbooksService.getAll();
        actions.set({ runbooks });
      } catch (error) {
        console.error('Runbooks page load failed', error);
      }

      dispatchSetLoading(dispatch, false);
      actions.setIsPopulateCompleted({ complete: true });
    },
  ),
};
