import { action, Action, Dispatch } from 'easy-peasy';

interface ILoadingStore {
  isActive: boolean;
  set: Action<ILoadingStore, { loading: boolean; clearFocus: boolean }>;
}

export const dispatchSetLoading = (
  dispatch: Dispatch,
  loading: boolean,
  clearFocus = true,
) => {
  dispatch({ type: '@action.loading.set', payload: { loading, clearFocus } });
};

export const loadingStore: ILoadingStore = {
  isActive: false,

  set: action((state, { loading, clearFocus }) => {
    if (clearFocus && loading && document.activeElement) {
      // Casts are bad, but this is the only way to get an HTML element out of the active element
      (document.activeElement as HTMLElement)?.blur();
    }

    state.isActive = loading;
  }),
};
