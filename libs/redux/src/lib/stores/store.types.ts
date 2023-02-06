import { createTypedHooks } from 'easy-peasy';
import { IStore } from './store';

const typedHooks = createTypedHooks<IStore>();
export const { useStoreActions, useStoreDispatch, useStoreState } = typedHooks;
