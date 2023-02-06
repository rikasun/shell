import { Action, Thunk } from 'easy-peasy';
import { INodeForm, INodeRunData } from '@cased/data';
import type { IStore, IStoreInjections } from '../../store';

export interface INodeRunResult {
  success: boolean;
  output: string;
  id?: number;
}

export interface IRunbookRunStore {
  formFields: INodeForm[];
  runData: INodeRunData;
  runResult: INodeRunResult[];

  clearAll: Action<IRunbookRunStore>;
  setRunFormFields: Action<IRunbookRunStore, { fields: INodeForm[] }>;
  setRunData: Action<
    IRunbookRunStore,
    {
      runData: INodeRunData;
    }
  >;
  setRunResult: Action<IRunbookRunStore, { runResult: INodeRunResult[] }>;

  setRunbookRunFormFields: Thunk<
    IRunbookRunStore,
    void,
    IStoreInjections,
    IStore
  >;

  setRunbookRunData: Thunk<
    IRunbookRunStore,
    {
      runData: INodeRunData;
    },
    IStoreInjections
  >;

  setRunbookRunResult: Thunk<
    IRunbookRunStore,
    { runResult: INodeRunResult[] },
    IStoreInjections
  >;

  run: Thunk<IRunbookRunStore, void, IStoreInjections, IStore>;
}
