import { IApproval } from '@cased/data';
import { Action, action, Thunk, thunk } from 'easy-peasy';

import type { IStoreInjections } from '../store';
import { dispatchSetLoading } from '../loading/loading.store';

export interface IApprovalsStore {
  allApprovals: IApproval[];
  populateAll: Thunk<IApprovalsStore, undefined, IStoreInjections>;
  setAllApprovals: Action<IApprovalsStore, IApproval[]>;

  approval?: IApproval;
  populateId: Thunk<IApprovalsStore, string, IStoreInjections>;
  updateApproval: Thunk<IApprovalsStore, IApproval, IStoreInjections>;
  setApproval: Action<IApprovalsStore, IApproval>;
}

export const approvalsStore: IApprovalsStore = {
  approval: undefined,
  allApprovals: [],

  setAllApprovals: action((state, approvals) => {
    state.allApprovals = [...approvals];
  }),

  setApproval: action((state, approval) => {
    state.approval = approval;

    // Update the approval in the full list
    const index = state.allApprovals.findIndex((a) => a.id === approval.id);
    if (index !== -1) {
      state.allApprovals[index] = approval;
    }
  }),

  updateApproval: thunk(async (actions, approval, { injections, dispatch }) => {
    dispatchSetLoading(dispatch, true);
    const updatedApproval = await injections.approvalsService.update(approval);
    actions.setApproval(updatedApproval);
    dispatchSetLoading(dispatch, false);
  }),

  populateAll: thunk(async (actions, _, { injections, dispatch }) => {
    dispatchSetLoading(dispatch, true);

    try {
      const approvals = await injections.approvalsService.getAll();
      actions.setAllApprovals(approvals);
    } catch (error) {
      console.error('Failed to fetch approvals', error);
    }

    dispatchSetLoading(dispatch, false);
  }),

  populateId: thunk(async (actions, id, { injections, dispatch }) => {
    dispatchSetLoading(dispatch, true);

    try {
      const approval = await injections.approvalsService.get(id);
      actions.setApproval(approval);
    } catch (error) {
      console.error('Failed to fetch approvals', error);
    }

    dispatchSetLoading(dispatch, false);
  }),
};

export default approvalsStore;
