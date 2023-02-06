import { render } from '@testing-library/react';
import FormLabels from './form-labels';

describe('FormLabels', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FormLabels
        label="My Label"
        name="Custom Name"
        suggestions={[]}
        selections={[]}
        onSearch={() => {}}
        onAdd={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(baseElement).toBeTruthy();
  });
});
