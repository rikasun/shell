import { INodeActionData } from '@cased/data';
import { Button } from '@cased/ui';
import { useCallback, useMemo } from 'react';
import FormNodeDatabase from '../forms/form-node-database/form-node-database';
import FormNodeForm from '../forms/form-node-form/form-node-form';
import FormNodeMarkdown from '../forms/form-node-markdown/form-node-markdown';
import FormNodeRest from '../forms/form-node-rest/form-node-rest';
import FormNodeShell from '../forms/form-node-shell/form-node-shell';
import './node-inspector-panel.scss';

export interface INodePanelProps {
  id: string;
  node: INodeActionData;
  onSave: (node: INodeActionData) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

export function NodePanel({
  id,
  onSave,
  node,
  onCancel,
  onDelete,
}: INodePanelProps) {
  const saveNode = useCallback(
    (data: INodeActionData) => {
      onSave({
        ...data,
      });
    },
    [onSave],
  );

  const deleteNode = useCallback(() => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        'Are you sure you want to delete this? This action cannot be undone',
      )
    )
      onDelete(id);
  }, [onDelete, id]);

  const printForm = useMemo(() => {
    if (node.markdown) {
      return (
        <FormNodeMarkdown
          name={node.name}
          text={node.markdown.content}
          onSubmit={saveNode}
        />
      );
    }

    if (node.shell) {
      return (
        <FormNodeShell
          name={node.name}
          prompt={node.shell.prompt}
          text={node.shell.text}
          onSubmit={saveNode}
        />
      );
    }

    if (node.database) {
      return (
        <FormNodeDatabase
          name={node.name}
          databaseServer={node.database.databaseServer}
          text={node.database.text}
          onSubmit={saveNode}
        />
      );
    }

    if (node.api) {
      return (
        <FormNodeRest
          name={node.name}
          providerId={node.api.providerId}
          httpMethod={node.api.httpMethod}
          path={node.api.path}
          headers={node.api.headers}
          queryParameters={node.api.queryParameters}
          onSubmit={saveNode}
        />
      );
    }

    if (node.form) {
      return (
        <FormNodeForm name={node.name} fields={node.form} onSubmit={saveNode} />
      );
    }

    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 flex-shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Error! No inspector panel found to handle the current node type.
            Please add a new form in the NodeInspectorPanel
          </span>
        </div>
      </div>
    );
  }, [node, saveNode]);

  return (
    <div className="node-panel">
      <div className="node-panel__section">
        <h1>Inspector</h1>

        {printForm}

        <div className="flex flex-row gap-2">
          <Button
            display="danger"
            className="basis-1/2"
            onClick={deleteNode}
            size="small"
          >
            Delete
          </Button>

          <Button className="basis-1/2" onClick={onCancel} size="small">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NodePanel;
