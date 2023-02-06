import { render } from '@testing-library/react';
import { StoreProvider } from 'easy-peasy';
import { Position } from 'react-flow-renderer';
import { getMockStore } from '@cased/redux';

import EdgeAdd from './edge-add';

describe('EdgeAdd', () => {
  const setup = () => {
    const component = render(
      <StoreProvider store={getMockStore()}>
        <svg>
          <EdgeAdd
            id=""
            source=""
            target=""
            sourceX={0}
            sourceY={0}
            targetX={0}
            targetY={0}
            sourcePosition={Position.Bottom}
            targetPosition={Position.Top}
          />
        </svg>
      </StoreProvider>,
    );

    return {
      component,
    };
  };

  it('should render successfully', () => {
    const { component } = setup();

    expect(component.baseElement).toBeTruthy();
  });
});
