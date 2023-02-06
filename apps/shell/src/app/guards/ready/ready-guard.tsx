import { useEffect, useMemo, useState } from 'react';

export interface SettingsGuardProps {
  waitFor: () => Promise<unknown>;
  children: React.ReactNode;
}

export function ReadyGuard({ children, waitFor }: SettingsGuardProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    waitFor().then(() => setReady(true));
  }, [waitFor]);

  const printPage = useMemo(() => {
    if (!ready) {
      return null;
    }

    return children;
  }, [ready, children]);

  return <div className="h-full">{printPage}</div>;
}

export default ReadyGuard;
