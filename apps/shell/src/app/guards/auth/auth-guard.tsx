import { useEffect, useMemo } from 'react';
import './auth-guard.scss';
import { useStoreActions, useStoreState } from '@cased/redux';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useStoreState((store) => store.auth.user);
  const restoreComplete = useStoreState((store) => store.auth.restoreComplete);
  const restore = useStoreActions((store) => store.auth.restore);

  useEffect(() => {
    if (!restoreComplete) {
      restore();
      return;
    }

    if (!user) {
      window.location.href = '/auth/login';
    }
  }, [restoreComplete, user, restore]);

  const printPage = useMemo(() => {
    if (!restoreComplete || !user) {
      return null;
    }

    return children;
  }, [restoreComplete, children, user]);

  return <div className="h-full">{printPage}</div>;
}

export default AuthGuard;
