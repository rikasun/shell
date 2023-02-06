import { IApiProvider } from '@cased/remotes';
import { render } from '@testing-library/react';

import ProviderForm from './provider-form';

describe('ProviderForm', () => {
  it('should render successfully', () => {
    const form: IApiProvider = {
      id: '1',
      name: 'test',
      authType: 'basic',
    };
    const { baseElement } = render(
      <ProviderForm onSubmit={() => {}} form={form} onChange={() => {}} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
