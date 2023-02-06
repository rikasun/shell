import NotFoundGuard from '../guards/not-found/not-found-guard';

/**
 * Universal page router included on every page
 */
export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <NotFoundGuard>{children}</NotFoundGuard>;
}

export default PageWrapper;
