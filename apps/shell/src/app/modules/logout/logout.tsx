import { Loader } from '@cased/ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreActions } from '@cased/redux';
import './logout.scss';

export function Logout() {
  const navigate = useNavigate();
  const logout = useStoreActions((store) => store.auth.logout);

  useEffect(() => {
    logout().then(() => navigate('/'));
  }, [navigate, logout]);

  return (
    <div data-testid="page-logout" className="h-full w-full pt-5">
      <Loader className="mx-auto block" />
    </div>
  );
}

export default Logout;
