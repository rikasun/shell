import { render } from '@testing-library/react';
import Button from './button';

describe('ButtonPrimary', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Button onClick={() => {}}>My Text</Button>);
    expect(baseElement).toBeTruthy();
  });
});
