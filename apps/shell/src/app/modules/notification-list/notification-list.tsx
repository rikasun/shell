import { useMemo } from 'react';
import { useStoreState, useStoreActions } from '@cased/redux';
import './notification-list.scss';

export function NotificationList() {
  const errors = useStoreState((state) => state.notifications.messages);
  const removeError = useStoreActions(
    (actions) => actions.notifications.remove,
  );

  const printErrors = useMemo(
    () =>
      errors.map(({ message, id }) => (
        <button
          key={id}
          onClick={() => removeError({ id })}
          className="alert alert-error d-block mb-1 border bg-red-600 p-2 text-sm text-white shadow-lg"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 flex-shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message}</span>
          </div>
        </button>
      )),
    [errors, removeError],
  );

  return <div className="notification-list">{printErrors}</div>;
}

export default NotificationList;
