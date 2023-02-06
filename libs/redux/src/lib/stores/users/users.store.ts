import { Thunk, thunk } from 'easy-peasy';
import { dispatchSetLoading } from '../loading/loading.store';
import {
  dispatchNotification,
  NotificationType,
} from '../notifications/notifications.store';
import type { IStoreInjections } from '../store';

interface IUsersStore {
  create: Thunk<
    IUsersStore,
    { email: string; password: string },
    IStoreInjections,
    IUsersStore,
    Promise<boolean>
  >;
}

export const usersStore: IUsersStore = {
  create: thunk(async (_, { email, password }, { injections, dispatch }) => {
    const { usersService } = injections;
    dispatchSetLoading(dispatch, true);

    let success = true;
    try {
      await usersService.create(email, password);
      dispatchNotification(
        dispatch,
        'User created successfully',
        NotificationType.Success,
      );
    } catch (error) {
      dispatchNotification(
        dispatch,
        'Failed to create user. Please try again',
        NotificationType.Error,
      );

      success = false;
    }

    dispatchSetLoading(dispatch, false);
    return success;
  }),
};
