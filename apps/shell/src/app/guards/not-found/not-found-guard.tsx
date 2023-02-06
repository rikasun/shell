import './not-found-guard.scss';

import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useStoreActions, useStoreState } from '@cased/redux';
import NotFound from '../../modules/not-found/not-found';

export interface NotFoundGuardProps {
  children?: React.ReactNode;
}

export function NotFoundGuard({ children }: NotFoundGuardProps) {
  const is404Error = useStoreState(
    (storeData) => storeData.notifications.is404,
  );
  const set404Error = useStoreActions(
    (storeActions) => storeActions.notifications.set404,
  );

  const location = useLocation();

  useEffect(() => {
    set404Error({ is404: false });
  }, [location, set404Error]);

  const printPage = useMemo(() => {
    if (is404Error) {
      return <NotFound />;
    }

    return children;
  }, [children, is404Error]);

  return <div className="h-full">{printPage}</div>;
}

export default NotFoundGuard;
