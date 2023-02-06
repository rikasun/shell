import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import FeaturedPrompt from './featured-prompt';

describe('Featured prompt', () => {
  interface IOptions {
    needAccess: boolean;
  }
  const setup = (options: IOptions = { needAccess: false }) =>
    render(
      <StoreProvider store={getMockStore()}>
        <FeaturedPrompt
          name="name 1"
          description="description"
          slug="slug"
          needsMoreInfo={false}
          needAccess={options.needAccess}
          approvalRequired={false}
          connect={() => {}}
        />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
  it('should render successfully', () => {
    const { getByText } = setup();
    expect(getByText('name 1')).toBeTruthy();
  });

  it('should render need access button when needAccess is true', () => {
    const { getByText } = setup({ needAccess: true });
    expect(getByText('Launch (Access permission needed)')).toBeTruthy();
  });

  it('should allow launch when needAccess is false', () => {
    const { getByText } = setup({ needAccess: false });
    expect(getByText('Launch')).toBeTruthy();
  });
});
