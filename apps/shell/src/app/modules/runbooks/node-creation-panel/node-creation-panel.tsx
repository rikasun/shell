import { INodeActionData } from '@cased/data';
import { Button } from '@cased/ui';
import { useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreActions } from '@cased/redux';
import FormNodeDatabase from '../forms/form-node-database/form-node-database';
import FormNodeForm from '../forms/form-node-form/form-node-form';
import FormNodeMarkdown from '../forms/form-node-markdown/form-node-markdown';
import FormNodeRest from '../forms/form-node-rest/form-node-rest';
import FormNodeShell from '../forms/form-node-shell/form-node-shell';
import { NodeType } from '../node-type';
import { ICreateNode } from './i-create-node';

import './node-creation-panel.scss';

export interface NodeCreationPanelProps {
  pageId: string | undefined;
  nodeType: NodeType;
  creatableNodes: ICreateNode[];
  onCancel: () => void;
}

// @TODO Move to Storybook
export function NodeCreationPanel({
  pageId,
  nodeType,
  creatableNodes,
  onCancel,
}: NodeCreationPanelProps) {
  const createNode = useStoreActions((store) => store.runbooks.createNode);
  const [, setSearchParams] = useSearchParams();

  const clickCreateNode = useCallback(
    (node: INodeActionData) => {
      createNode({ node }).then((success) => {
        if (success) setSearchParams({});
      });
    },
    [createNode, setSearchParams],
  );

  const printCreateNodesList = useMemo(() => {
    if (nodeType !== NodeType.None) return null;

    return (
      <ul>
        {creatableNodes.map(({ id, title, icon }) => (
          <li className="" key={id}>
            <Link
              className=""
              to={`/runbooks/${pageId}?create=${id}`}
              data-testid={`create-${id}`}
            >
              <button className="block flex w-full items-center px-6 py-2.5 hover:bg-zinc-100">
                {icon}
                <div className="ml-2">
                  <h3 className="text-sm">{title}</h3>
                </div>
              </button>
            </Link>
          </li>
        ))}
      </ul>
    );
  }, [creatableNodes, pageId, nodeType]);

  const printForm = useMemo(() => {
    switch (nodeType) {
      case NodeType.Markdown:
        return <FormNodeMarkdown onSubmit={clickCreateNode} />;
      case NodeType.Shell:
        return <FormNodeShell onSubmit={clickCreateNode} />;
      case NodeType.Database:
        return <FormNodeDatabase onSubmit={clickCreateNode} />;
      case NodeType.Rest:
        return (
          <FormNodeRest
            headers={[]}
            queryParameters={[]}
            onSubmit={clickCreateNode}
          />
        );
      case NodeType.Form:
        return <FormNodeForm onSubmit={clickCreateNode} fields={[]} />;
      default:
        return null;
    }
  }, [nodeType, clickCreateNode]);

  return (
    <div className="node-creation-panel fixed top-14 left-0 z-50 w-72 overflow-y-scroll border-r border-zinc-200 bg-white p-4">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide">
        Create A Node
      </h2>

      {printCreateNodesList}
      {printForm}
      <div className="mt-12">
        <Button onClick={onCancel} className="block w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default NodeCreationPanel;
