import { render } from '@testing-library/react';

import ModalPermissions from './modal-permissions';

describe('ModalPermissions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ModalPermissions />);
    expect(baseElement).toBeTruthy();
  });
});
