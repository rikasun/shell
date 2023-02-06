import { Loader } from '@cased/ui';
import clsx from 'clsx';
import { useMemo } from 'react';
import './loading.scss';
import { useStoreState } from '@cased/redux';

export function Loading() {
  const isLoading = useStoreState((store) => store.loading.isActive);

  const className = useMemo(
    () =>
      clsx('loading z-top w-full h-full fixed top-0 left-0 bg-transparent', {
        hidden: !isLoading,
      }),
    [isLoading],
  );

  return (
    <div data-testid="loading" className={className}>
      <div className="loading__spinner">
        <Loader size="large" />
      </div>
    </div>
  );
}

export default Loading;
