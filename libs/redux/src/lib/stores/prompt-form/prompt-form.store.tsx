import { ApprovalStatus, IPromptForm, IPromptMoreInfoForm } from '@cased/data';
import { action, Action, Computed, computed, Thunk, thunk } from 'easy-peasy';
import {
  dispatchNotification,
  dispatchSet404,
  NotificationType,
} from '../notifications/notifications.store';
import { dispatchSetLoading } from '../loading/loading.store';
import type { IStoreInjections, IStore } from '../store';

export interface IPromptFormStore {
  prompt: IPromptForm;
  setPrompt: Action<IPromptFormStore, { prompt: IPromptForm }>;
  promptForm: IPromptMoreInfoForm;
  setPromptForm: Action<IPromptFormStore, { promptForm: IPromptMoreInfoForm }>;
  showPromptForm: Computed<IPromptFormStore, boolean>;
  populate: Thunk<IPromptFormStore, { slug: string }, IStoreInjections, IStore>;
  submitForm: Thunk<
    IPromptFormStore,
    { form: IPromptMoreInfoForm },
    IStoreInjections,
    IStore
  >;
}

export const defaultPrompt = {
  name: '',
  description: '',
  slug: '',
  ipAddress: '',
  hostname: '',
  port: 22,
  username: '',
  labels: {},
  certificateAuthentication: false,
  needsAuthentication: false,
  authorizationExplanation: '',
  promptForUsername: false,
  promptForKey: false,
  keyStored: false,
  sshPassphrase: false,
  reasonRequired: false,
  needsMoreInfo: true,
  approvalRequired: false,
};

export const promptFormStore: IPromptFormStore = {
  prompt: { ...defaultPrompt },
  setPrompt: action((state, { prompt }) => {
    state.prompt = prompt;
  }),

  promptForm: {},
  setPromptForm: action((state, { promptForm }) => {
    state.promptForm = promptForm;
  }),

  showPromptForm: computed((state) => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const approvalStatus = params.get('status') || '';

    if (
      state.prompt.needsMoreInfo &&
      Object.keys(state.promptForm)?.length === 0
    )
      return true;

    if (
      state.prompt.approvalRequired &&
      state.promptForm.approvalStatus !== ApprovalStatus.Approved
    ) {
      // istanbul ignore next
      if (
        approvalStatus === ApprovalStatus.Approved ||
        state.promptForm.approvalStatus === ApprovalStatus.Approved
      )
        return false;

      return true;
    }
    return false;
  }),

  populate: thunk(
    async (
      actions,
      { slug },
      { injections: { promptService }, dispatch, getStoreActions },
    ) => {
      dispatchSetLoading(dispatch, true);
      const { clearStatusBar } = getStoreActions().prompt;
      clearStatusBar();
      actions.setPrompt({ prompt: { ...defaultPrompt } });
      actions.setPromptForm({ promptForm: {} });

      try {
        const prompt = await promptService.get(slug);
        actions.setPrompt({ prompt });
        dispatchSetLoading(dispatch, false);
      } catch (error) {
        // istanbul ignore next
        console.error('Failed to fetch prompt', error);
        dispatchSet404(dispatch, true);
        dispatchSetLoading(dispatch, false);
      }
    },
  ),

  submitForm: thunk(
    async (actions, { form }, { dispatch, getState, getStoreActions }) => {
      const { approvalRequired, slug } = getState().prompt;
      // istanbul ignore next
      if (!approvalRequired) {
        actions.setPromptForm({ promptForm: { ...form } });
      } else {
        // istanbul ignore next
        const { requestApproval } = getStoreActions().prompt;
        try {
          const success = await requestApproval({ slug });
          // istanbul ignore next
          if (!success) return;

          actions.setPromptForm({
            promptForm: { ...form, approvalStatus: ApprovalStatus.Approved },
          });
          return;
        } catch (error) {
          // istanbul ignore next
          dispatchNotification(
            dispatch,
            'Approval request failed',
            NotificationType.Error,
          );
        }
      }
    },
  ),
};
