import { render } from '@testing-library/react';
import NodePanel from './node-inspector-panel';

describe('NodePanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NodePanel onSave={() => {}} onCancel={() => {}} node={{}} />,
    );

    expect(baseElement).toBeTruthy();
  });
});
