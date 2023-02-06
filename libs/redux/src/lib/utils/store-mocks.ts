import { createStore } from 'easy-peasy';
import {
  IRunbookGetResponse,
  IRunbookResponse,
  authService as AuthServiceType,
  storageService as StorageServiceType,
  axiosService as AxiosServiceType,
  settingsService as SettingsServiceType,
  settingsRunbooksService as SettingsRunbooksServiceType,
  IRunbookGetAllResponse,
  approvalsService as ApprovalServiceType,
  promptService as PromptServiceType,
  settingsApprovalsService as SettingsApprovalsServiceType,
  activitiesService as ActivitiesServiceType,
  usersService as UsersServiceType,
} from '@cased/remotes';
import { AllBlocks, INodeRunResultData } from '@cased/data';
import { A } from '@cased/test-utilities';
import {
  runbooksStore,
  runbooksListStore,
  authStore,
  EXAMPLE_RESTORE_TOKEN,
  loadingStore,
  notificationsStore,
  newRunbookStore,
  runbookRunStore,
  approvalsStore,
  settingsStore,
  promptStore,
  activitiesStore,
  settingsRunbooksStore,
  settingsApprovalsStore,
  dashboardStore,
  promptFormStore,
  IStore,
  usersStore,
} from '../stores';

interface IOptions {
  populateResponse?: IRunbookGetResponse;
  authService?: Partial<typeof AuthServiceType>;
  storageService?: Partial<typeof StorageServiceType>;
  axiosService?: Partial<typeof AxiosServiceType>;
  settingsService?: Partial<typeof SettingsServiceType>;
  settingsRunbooksService?: Partial<typeof SettingsRunbooksServiceType>;
  settingsApprovalsService?: Partial<typeof SettingsApprovalsServiceType>;
  createBlockResponse?: AllBlocks;
  updateBlockResponse?: AllBlocks;
  populateAllResponse?: IRunbookGetAllResponse;
  createRunbookResponse?: IRunbookResponse;
  approvalsService?: Partial<typeof ApprovalServiceType>;
  promptService?: Partial<typeof PromptServiceType>;
  runRunbookResponse?: INodeRunResultData;
  activitiesService?: Partial<typeof ActivitiesServiceType>;
  usersService?: Partial<typeof UsersServiceType>;
}

/**
 * Creates a store for testing purposes. Should be driven by overrides for customization
 * @TODO Should be moved into the test-utilities package after the redux layer is moved to a separate library
 * @param options
 * @returns
 */
export const getMockStore = (options: IOptions = {}) => {
  const authServiceTokenRestoreShim = {
    axiosService: {
      setToken: () => {},
    },
    storageService: {
      get: () => EXAMPLE_RESTORE_TOKEN,
      set: () => {},
      remove: () => {},
    },
    authService: {
      loginRefresh: () => Promise.resolve(EXAMPLE_RESTORE_TOKEN),
    },
  };

  const defaults: IOptions = {
    createBlockResponse: A.blockText().build(),
    updateBlockResponse: A.blockText().build(),
    ...authServiceTokenRestoreShim,
  };

  const {
    populateResponse,
    authService,
    storageService,
    axiosService,
    approvalsService,
    createBlockResponse,
    updateBlockResponse,
    populateAllResponse,
    createRunbookResponse,
    runRunbookResponse,
    promptService,
    settingsService = {},
    settingsRunbooksService,
    settingsApprovalsService,
    activitiesService,
    usersService,
  } = {
    ...defaults,
    ...options,
  };

  if (settingsRunbooksService)
    settingsService.runbooks = settingsRunbooksService as never;

  // We must hijack the type and cast it to never because we are overriding the nested service, probably a more type safe way to do this
  if (settingsApprovalsService)
    settingsService.approvals = settingsApprovalsService as never;

  const store = createStore<IStore>(
    {
      runbooks: runbooksStore,
      auth: authStore,
      loading: loadingStore,
      notifications: notificationsStore,
      runbooksList: runbooksListStore,
      runbookNew: newRunbookStore,
      runbookRun: runbookRunStore,
      approvals: approvalsStore,
      settings: settingsStore,
      activities: activitiesStore,
      prompt: promptStore,
      settingsRunbooks: settingsRunbooksStore,
      settingsApprovals: settingsApprovalsStore,
      dashboard: dashboardStore,
      promptForm: promptFormStore,
      users: usersStore,
    },
    {
      injections: {
        runbooksService: {
          get: () =>
            Promise.resolve({
              runbook: populateResponse?.runbook,
              prompts: populateResponse?.prompts,
              databases: populateResponse?.databases,
              apiProviders: populateResponse?.api_providers,
            }),
          createBlock: () => Promise.resolve({ block: createBlockResponse }),
          updateBlock: () => Promise.resolve({ block: updateBlockResponse }),
          deleteBlock: () => Promise.resolve(),
          getAll: () =>
            Promise.resolve({
              runbooks: populateAllResponse?.runbooks,
            }),
          create: () => Promise.resolve({ runbook: createRunbookResponse }),
          run: () => Promise.resolve({ result: runRunbookResponse }),
        },
        authService,
        storageService,
        axiosService,
        settingsService,
        approvalsService,
        promptService,
        activitiesService,
        usersService,

        // Suggested testing library implementation recommends using window history
        routerService: {
          navigate(url: string): void {
            window.history.pushState({}, '', url);
          },

          setSearchParams(params: Record<string, string>): void {
            window.history.pushState(params, '', window.location.pathname);
          },
        },
      },
    },
  );

  store.getActions().auth.setAccessToken({ token: EXAMPLE_RESTORE_TOKEN });

  return store;
};
