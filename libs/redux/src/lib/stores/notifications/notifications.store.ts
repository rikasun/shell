import { Action, action, Dispatch } from 'easy-peasy';
import { nanoid } from 'nanoid';

export enum NotificationType {
  Error = 'error',
  Success = 'success',
}

interface INotification {
  id: string;
  message: string;
  type: NotificationType;
}

interface INotificationStore {
  messages: INotification[];
  is404: boolean;

  add: Action<INotificationStore, { message: string; type: NotificationType }>;
  remove: Action<INotificationStore, { id: string }>;
  set404: Action<INotificationStore, { is404: boolean }>;
  clear: Action<INotificationStore>;
}

export const dispatchNotification = (
  dispatch: Dispatch,
  message: string,
  type: NotificationType,
) => {
  dispatch({ type: '@action.notifications.add', payload: { message, type } });
};

/**
 * @deprecated Use `dispatchNotification` instead
 */
export const dispatchAddError = (dispatch: Dispatch, message: string) => {
  dispatchNotification(dispatch, message, NotificationType.Error);
};

export const dispatchClearErrors = (dispatch: Dispatch) => {
  dispatch({ type: '@action.notifications.clear' });
};

export const dispatchSet404 = (dispatch: Dispatch, is404: boolean) => {
  dispatch({ type: '@action.notifications.set404', payload: { is404 } });
};

export const notificationsStore: INotificationStore = {
  messages: [],
  is404: false,

  add: action((state, { message, type }) => {
    state.messages.push({ message, id: nanoid(), type });
  }),

  remove: action((state, { id }) => {
    state.messages = state.messages.filter((message) => message.id !== id);
  }),

  set404: action((state, { is404 }) => {
    state.is404 = is404;
  }),

  clear: action((state) => {
    state.messages = [];
  }),
};
