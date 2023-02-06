import { nanoid } from 'nanoid';
import { useCallback, useMemo } from 'react';
import { getBezierPath, getEdgeCenter, EdgeProps } from 'react-flow-renderer';
import { useStoreActions } from '@cased/redux';
import './edge-add.scss';

export type EdgeAddProps = EdgeProps;

const foreignObjectSize = 40;

/**
 * Toggle this on to show the edge add button
 */
const SHOW_ADD_BUTTON = false;

export function EdgeAdd({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
}: EdgeAddProps) {
  const addNode = useStoreActions((store) => store.runbooks.addNode);

  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const onEdgeClick = useCallback(() => {
    // @TODO Long term this should open the inspector panel instead and highlight the correct edge somehow
    addNode({
      id: nanoid(),
      node: { name: 'Edge Click Node' },
      nodeParentId: source,
    });
  }, [addNode, source]);

  const printAddButton = useMemo(() => {
    if (!SHOW_ADD_BUTTON) return null;

    return (
      <div>
        <button
          type="button"
          className="edge-add"
          data-testid="edge-add"
          onClick={() => onEdgeClick()}
        >
          +
        </button>
      </div>
    );
  }, [onEdgeClick]);

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="edge-add__foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        {printAddButton}
      </foreignObject>
    </>
  );
}

export default EdgeAdd;
