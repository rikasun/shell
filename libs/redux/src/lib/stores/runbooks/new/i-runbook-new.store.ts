import { Action, Thunk } from 'easy-peasy';
import type { IStoreInjections } from '../../store';

export interface IRunbookNewStore {
  newRunbookId: string;
  name: string;
  description: string;
  isCreated: boolean;

  add: Action<
    IRunbookNewStore,
    {
      id: number;
      name: string;
      description: string;
    }
  >;
  setIsCreated: Action<IRunbookNewStore, { created: boolean }>;
  create: Thunk<
    IRunbookNewStore,
    { runbook: { name: string; description: string } },
    IStoreInjections,
    Record<string, never>,
    Promise<void>
  >;
}
