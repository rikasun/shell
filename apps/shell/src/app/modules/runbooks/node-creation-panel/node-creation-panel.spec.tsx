import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { BrowserRouter } from 'react-router-dom';
import { getMockStore } from '@cased/redux';
import { NodeType } from '../node-type';
import NodeCreationPanel from './node-creation-panel';

describe('NodeCreationPanel', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <NodeCreationPanel
          pageId="22"
          nodeType={NodeType.None}
          creatableNodes={[]}
          onCancel={() => {}}
        />
      </StoreProvider>,
      { wrapper: BrowserRouter },
    );
    expect(baseElement).toBeTruthy();
  });
});
