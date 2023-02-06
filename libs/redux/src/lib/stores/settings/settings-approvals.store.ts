import { action, thunk } from 'easy-peasy';
import { Debounce } from '@cased/utilities';
import {
  dispatchAddError,
  dispatchSet404,
} from '../notifications/notifications.store';
import { dispatchSetLoading } from '../loading/loading.store';
import { ISettingsApprovalsStore } from './i-settings-approvals.store';

const AUTO_SAVE_DELAY = 1500;
const AUTO_SAVE_DEBOUNCE = new Debounce(AUTO_SAVE_DELAY);

/**
 * @TODO Split this into an index and edit store file
 */
export const settingsApprovalsStore: ISettingsApprovalsStore = {
  programs: [],
  access: [],
  approvalUsersSearch: [],
  approvedUsers: [],

  setApprovedUsers: action((state, { users }) => {
    state.approvedUsers = users;
  }),

  setPrograms: action((state, { programs }) => {
    state.programs = programs;
  }),

  setAccess: action((state, { access }) => {
    state.access = access;
  }),

  setApprovalUsersSearch: action((state, { users }) => {
    state.approvalUsersSearch = users;
  }),

  removeProgram: action((state, { id }) => {
    state.programs = state.programs.filter((program) => program.id !== id);
  }),

  clear: action((state) => {
    state.programs = [];
    state.access = [];
    state.approvalUsersSearch = [];
    state.approvedUsers = [];
  }),

  populate: thunk(
    async (actions, _, { injections: { settingsService }, dispatch }) => {
      actions.setApprovalUsersSearch({ users: [] });
      dispatchSetLoading(dispatch, true);

      const { programs, access } =
        await settingsService.approvals.getApprovals();
      actions.setPrograms({ programs });
      actions.setAccess({ access });

      dispatchSetLoading(dispatch, false);
    },
  ),

  createProgram: thunk(
    async (
      actions,
      { slug, description },
      { injections: { settingsService }, dispatch },
    ) => {
      dispatchSetLoading(dispatch, true);

      try {
        const { id } = await settingsService.approvals.createProgramApproval(
          slug,
          description,
        );

        return { id };
      } catch (error) {
        dispatchAddError(
          dispatch,
          'Failed to create approval. Please try again',
        );
      }

      dispatchSetLoading(dispatch, false);
      return {};
    },
  ),

  deleteProgram: thunk(
    async (actions, { id }, { injections: { settingsService }, dispatch }) => {
      dispatchSetLoading(dispatch, true);

      try {
        await settingsService.approvals.deleteProgramApproval(id);
        actions.removeProgram({ id });
      } catch (error) {
        dispatchAddError(
          dispatch,
          'Failed to delete approval. Please try again',
        );
      }

      dispatchSetLoading(dispatch, false);
    },
  ),

  /**
   * @TODO Move to a separate edit store that manages the data instead of loading it into the component
   */
  retrieveApprovalProgram: thunk(
    async (actions, { id }, { injections: { settingsService }, dispatch }) => {
      actions.clear();
      dispatchSetLoading(dispatch, true);

      try {
        const form = await settingsService.approvals.getApprovalProgram(id);
        dispatchSetLoading(dispatch, false);
        actions.setApprovedUsers({
          users: form.restrictedUsers.map((user) => ({
            id: user.id,
            text: user.name,
          })),
        });

        return form;
      } catch (e) {
        console.error(e);
        dispatchSetLoading(dispatch, false);
        dispatchSet404(dispatch, true);
        return null;
      }
    },
  ),

  /**
   * @TODO Move to a separate edit store that manages the data instead of loading it into the component
   */
  retrieveApprovalAccess: thunk(
    async (actions, { id }, { injections: { settingsService }, dispatch }) => {
      actions.clear();
      dispatchSetLoading(dispatch, true);

      try {
        const form = await settingsService.approvals.getApprovalAccess(id);
        dispatchSetLoading(dispatch, false);
        actions.setApprovedUsers({
          users: form.restrictedUsers.map((user) => ({
            id: user.id,
            text: user.name,
          })),
        });

        return form;
      } catch (e) {
        console.error(e);
        dispatchSetLoading(dispatch, false);
        dispatchSet404(dispatch, true);
        return null;
      }
    },
  ),

  submitApprovalProgram: thunk(
    async (
      _,
      { id, program },
      { injections: { settingsService }, dispatch },
    ) => {
      dispatchSetLoading(dispatch, true);
      await settingsService.approvals.setApprovalProgram(id, program);
      dispatchSetLoading(dispatch, false);
    },
  ),

  submitApprovalAccess: thunk(
    async (
      _,
      { id, access },
      { injections: { settingsService }, dispatch },
    ) => {
      dispatchSetLoading(dispatch, true);
      await settingsService.approvals.setApprovalAccess(id, access);
      dispatchSetLoading(dispatch, false);
    },
  ),

  autoUpdateApprovalProgram: thunk(
    async (
      _,
      { id, program },
      { injections: { settingsService }, dispatch },
    ) => {
      AUTO_SAVE_DEBOUNCE.run(async () => {
        dispatchSetLoading(dispatch, true);
        await settingsService.approvals.setApprovalProgram(id, program);
        dispatchSetLoading(dispatch, false);
      });
    },
  ),

  autoUpdateApprovalAccess: thunk(
    async (
      _,
      { id, access },
      { injections: { settingsService }, dispatch },
    ) => {
      AUTO_SAVE_DEBOUNCE.run(async () => {
        dispatchSetLoading(dispatch, true);
        await settingsService.approvals.setApprovalAccess(id, access);
        dispatchSetLoading(dispatch, false);
      });
    },
  ),

  populateApprovalUsersSearch: thunk(
    async (
      actions,
      { query, id },
      { injections: { settingsService }, dispatch },
    ) => {
      actions.setApprovalUsersSearch({ users: [] });
      dispatchSetLoading(dispatch, true, false);

      try {
        const users = (
          await settingsService.approvals.getApprovalUsersSearch(id, query)
        ).map(({ id: userId, name: text }) => ({
          id: userId,
          text,
        }));

        dispatchSetLoading(dispatch, false);
        actions.setApprovalUsersSearch({ users });
      } catch (e) {
        console.error(e);
        dispatchSetLoading(dispatch, false);
        dispatchAddError(dispatch, 'Failed to search users');
      }
    },
  ),

  addAuthorizedUser: thunk(
    async (
      { setApprovedUsers },
      { id, user },
      { injections: { settingsService }, dispatch, getState },
    ) => {
      dispatchSetLoading(dispatch, true);

      try {
        await settingsService.approvals.addAuthorizedUser(id, user.id);
        setApprovedUsers({
          users: [...getState().approvedUsers, { ...user }],
        });
      } catch (e) {
        console.error(e);
        dispatchAddError(dispatch, 'Failed to add user. Please try again');
      }

      dispatchSetLoading(dispatch, false);
    },
  ),

  removeAuthorizedUser: thunk(
    async (
      { setApprovedUsers },
      { id, user },
      { injections: { settingsService }, dispatch, getState },
    ) => {
      let success = true;
      dispatchSetLoading(dispatch, true);

      try {
        await settingsService.approvals.removeAuthorizedUser(id, user.id);
        setApprovedUsers({
          users: getState().approvedUsers.filter(
            ({ id: userId }) => userId !== user.id,
          ),
        });
      } catch (e) {
        success = false;
        console.error(e);
        dispatchAddError(dispatch, 'Failed to remove user. Please try again');
      }

      dispatchSetLoading(dispatch, false);
      return success;
    },
  ),
};
