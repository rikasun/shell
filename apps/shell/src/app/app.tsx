import { RouterProvider } from 'react-router-dom';
import { StoreProvider } from 'easy-peasy';
import { store } from '@cased/redux';
import { routerService } from '@cased/remotes';
import { router } from './routes/router';
import Loading from './modules/loading/loading';
import NotificationList from './modules/notification-list/notification-list';

import './app.scss';

// @NOTE This must be casted since the type has an import conflict with the remix state manager version
routerService.router = router as never;

export function App() {
  return (
    <StoreProvider store={store}>
      <NotificationList />
      <Loading />
      <RouterProvider router={router} />
    </StoreProvider>
  );
}

export default App;
