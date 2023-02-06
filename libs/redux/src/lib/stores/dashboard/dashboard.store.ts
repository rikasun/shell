import { IPrompt } from '@cased/data';
import { action, Action, Thunk, thunk } from 'easy-peasy';
import { dispatchSetLoading } from '../loading/loading.store';
import type { IStoreInjections, IStore } from '../store';
import { filterPromptsBySearch } from './dashboard-store-helpers';

export interface IDashboardStore {
  search: string;
  setSearch: Action<IDashboardStore, { search: string }>;
  prompts: IPrompt[];
  setPrompts: Action<IDashboardStore, { prompts: IPrompt[] }>;
  filteredPrompts: IPrompt[];
  setFilteredPrompts: Action<IDashboardStore, { prompts: IPrompt[] }>;
  filterPrompts: Thunk<IDashboardStore, { q: string }, IStoreInjections>;
  populate: Thunk<IDashboardStore, void, IStoreInjections, IStore>;
  connect: Thunk<
    IDashboardStore,
    { approvalRequired: boolean; slug: string; needsMoreInfo: boolean },
    IStoreInjections,
    IStore
  >;
}

export const dashboardStore: IDashboardStore = {
  search: '',
  setSearch: action((state, { search }) => {
    state.search = search;
  }),
  prompts: [],
  setPrompts: action((state, { prompts }) => {
    state.prompts = prompts;
  }),
  filteredPrompts: [],
  setFilteredPrompts: action((state, { prompts }) => {
    state.filteredPrompts = prompts;
  }),

  populate: thunk(
    async (
      actions,
      _,
      { injections: { promptService }, dispatch, getStoreActions },
    ) => {
      dispatchSetLoading(dispatch, true);
      const { clearStatusBar } = getStoreActions().prompt;
      clearStatusBar();
      try {
        const allPrompts = await promptService.getAll();
        actions.setPrompts({ prompts: allPrompts });
        actions.setFilteredPrompts({ prompts: allPrompts });
      } catch (error) {
        // istanbul ignore next
        console.error('Failed to fetch prompts', error);
      }

      dispatchSetLoading(dispatch, false);
    },
  ),

  filterPrompts: thunk(
    async (actions, { q }, { injections: { promptService } }) => {
      const allPrompts = await promptService.getAll();
      const search = q;

      const result = filterPromptsBySearch(allPrompts, search);

      actions.setFilteredPrompts({ prompts: result });
    },
  ),

  connect: thunk(
    async (
      _,
      { approvalRequired, slug, needsMoreInfo },
      { injections: { routerService }, getStoreActions },
    ) => {
      const { requestApproval } = getStoreActions().prompt;

      if (approvalRequired && !needsMoreInfo) {
        const success = await requestApproval({ slug });
        if (success) {
          routerService.navigate(`/prompts/${slug}?status=approved`);
        }
        return;
      }
      routerService.navigate(`/prompts/${slug}`);
    },
  ),
};
