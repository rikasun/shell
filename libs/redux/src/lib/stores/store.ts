import { createStore } from 'easy-peasy';
import * as services from '@cased/remotes';
import { authStore } from './auth/auth.store';
import { loadingStore } from './loading/loading.store';
import { notificationsStore } from './notifications/notifications.store';
import { runbooksStore } from './runbooks/runbooks.store';
import { runbooksListStore } from './runbooks/list/runbooks-list.store';
import { newRunbookStore } from './runbooks/new/runbook-new.store';
import { runbookRunStore } from './runbooks/run/runbook-run.store';
import approvalsStore from './approvals/approvals.store';
import { settingsStore } from './settings/settings.store';
import { promptStore } from './prompt/prompt.store';
import { activitiesStore } from './activities/activities.store';
import { settingsRunbooksStore } from './settings/settings-runbooks.store';
import { settingsApprovalsStore } from './settings/settings-approvals.store';
import { dashboardStore } from './dashboard/dashboard.store';
import { promptFormStore } from './prompt-form/prompt-form.store';
import { usersStore } from './users/users.store';

const model = {
  runbooks: runbooksStore,
  auth: authStore,
  loading: loadingStore,
  notifications: notificationsStore,
  runbooksList: runbooksListStore,
  runbookNew: newRunbookStore,
  runbookRun: runbookRunStore,
  approvals: approvalsStore,
  settings: settingsStore,
  prompt: promptStore,
  activities: activitiesStore,
  settingsRunbooks: settingsRunbooksStore,
  settingsApprovals: settingsApprovalsStore,
  dashboard: dashboardStore,
  promptForm: promptFormStore,
  users: usersStore,
};

const injections = { ...services };

export type IStoreInjections = typeof injections;
export type IStore = typeof model;

export const store = createStore<IStore, undefined, IStoreInjections>(model, {
  injections,
});
