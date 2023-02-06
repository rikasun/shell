import { useEffect, useState } from 'react';
import { useStoreActions } from '@cased/redux';
import './runbooks-guard.scss';

/* eslint-disable-next-line */
export interface RunbooksGuardProps {
  children: React.ReactNode;
}

export function RunbooksGuard({ children }: RunbooksGuardProps) {
  const [ready, setReady] = useState(false);
  const reset = useStoreActions((actions) => actions.runbooks.clearAll);
  const resetRun = useStoreActions((actions) => actions.runbookRun.clearAll);

  useEffect(() => {
    reset();
    resetRun();

    // We need a frame to pass for the reset to take effect
    Promise.resolve().then(() => setReady(true));
  }, [reset, resetRun]);

  if (!ready) return null;

  return <div>{children}</div>;
}

export default RunbooksGuard;
