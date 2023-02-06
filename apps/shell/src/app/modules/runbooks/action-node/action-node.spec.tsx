import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import ReactFlow from 'react-flow-renderer';
import { mockReactFlow } from '@cased/test-utilities';
import { getMockStore } from '@cased/redux';
import ActionNode from './action-node';

describe('ActionNode', () => {
  it('should render successfully', () => {
    mockReactFlow();

    const { baseElement } = render(
      <StoreProvider store={getMockStore()}>
        <ReactFlow>
          <ActionNode
            id=""
            type=""
            data={{
              handleBeginHide: false,
              handleEndHide: false,
              selected: false,
              name: '',
              subtitle: '',
              description: '',
              hasDelete: false,
            }}
            selected={false}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}
            zIndex={0}
          />
        </ReactFlow>
      </StoreProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
