import { useMemo } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { INodeActionData } from '@cased/data';
import './action-node.scss';

type INodeActionProps = NodeProps<INodeActionData>;

/**
 * @link https://reactflow.dev/docs/examples/nodes/custom-node/
 */
export function ActionNode({
  data: {
    handleBeginHide,
    handleEndHide,
    selected,
    name,
    markdown,
    shell,
    database,
    api,
    form,
  },
}: INodeActionProps) {
  const classNames = useMemo(() => {
    let className = 'app-action-node';
    if (selected) className += ' app-action-node--active';
    return className;
  }, [selected]);

  const title = useMemo(() => {
    if (markdown) return 'Markdown';
    if (shell) return 'Shell';
    if (database) return 'Database';
    if (api) return 'REST API';
    if (form) return 'Form';

    return 'Unknown';
  }, [markdown, shell, database, api, form]);

  return (
    <div className={classNames}>
      <Handle
        isConnectable={false}
        type="target"
        position={Position.Top}
        className={handleBeginHide ? 'app-action-node__invisible' : ''}
      />

      <div className="app-action-node__content">
        <h3>{title}</h3>
        <p>{name}</p>
      </div>

      <Handle
        isConnectable={false}
        type="source"
        position={Position.Bottom}
        className={handleEndHide ? 'app-action-node__invisible' : ''}
      />
    </div>
  );
}

export default ActionNode;
