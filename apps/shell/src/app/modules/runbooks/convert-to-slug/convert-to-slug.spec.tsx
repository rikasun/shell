import { render } from '@testing-library/react';

import ConvertToSlug from './convert-to-slug';

describe('SlugDisplay', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConvertToSlug text="" />);
    expect(baseElement).toBeTruthy();
  });

  it('should convert the slug as expected', () => {
    const text = 'hello_!!-_234-@@@ world';

    const { getByText } = render(<ConvertToSlug text={text} />);

    expect(getByText('hello_234_world')).toBeTruthy();
  });
});
