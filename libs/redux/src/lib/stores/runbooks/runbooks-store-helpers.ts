import {
  AllBlocks,
  BlockType,
  INodeAction,
  INodeActionData,
  INodeRunResultData,
} from '@cased/data';
import { Edge } from 'react-flow-renderer';
import { nanoid } from 'nanoid';

export const NODE_SPACING = 100;

export const updateNodePositions = (nodes: INodeAction[]) => {
  nodes.forEach((node, index) => {
    node.data.handleBeginHide = index === 0;
    node.data.handleEndHide = index === nodes.length - 1;

    node.position = {
      x: 0,
      y: index * NODE_SPACING,
    };
  });
};

export const createEdge = (
  sourceId: string,
  targetId: string,
): Edge<unknown> => ({
  id: `e${sourceId}-${targetId}`,
  source: `${sourceId}`,
  target: targetId,
  type: 'edgeAdd',
});

export const createAllEdges = (nodes: INodeAction[]) => {
  const edges: Edge[] = [];
  nodes.forEach((node, index) => {
    if (index === 0) return;
    edges.push(createEdge(nodes[index - 1].id, node.id));
  });

  return edges;
};

export const transformNodeToApiBlock = (
  runbookId: string,
  data: INodeActionData,
  id?: string,
): AllBlocks => {
  const block = {
    id: id ? parseInt(id, 10) : undefined,
    name: data.name || '',
    runbook_id: runbookId,
    sort_order: 1,
  };

  if (data.markdown) {
    return {
      ...block,
      block_type: BlockType.Text,
      data: {
        text: data.markdown.content || '',
      },
    };
  }

  if (data.shell) {
    return {
      ...block,
      block_type: BlockType.Shell,
      data: {
        prompt: data.shell.prompt,
        command: data.shell.text,
      },
    };
  }

  if (data.database) {
    return {
      ...block,
      block_type: BlockType.Database,
      data: {
        database_id: data.database.databaseServer,
        query: data.database.text,
      },
    };
  }

  if (data.api) {
    return {
      ...block,
      block_type: BlockType.Rest,
      data: {
        query_parameters: data.api.queryParameters,
        headers: data.api.headers,
        api_provider_id: data.api.providerId,
        api_path: data.api.path,
        http_method: data.api.httpMethod,
        text: '',
      },
    };
  }

  if (data.form) {
    return {
      ...block,
      block_type: BlockType.Form,
      data: {
        form_fields: data.form,
      },
    };
  }

  // istanbul ignore next
  throw new Error('Failed to transform node to api block');
};

export const transformApiBlockToNode = (
  { id, name, block_type, data }: AllBlocks,
  index = 0,
  length = 1,
) => {
  const node: INodeAction = {
    id: id?.toString() || '1',
    type: 'action',
    position: { x: 0, y: NODE_SPACING * index },
    data: {
      name,
      handleBeginHide: index === 0,
      handleEndHide: index === length - 1,
    },
  };

  if (block_type === BlockType.Text) {
    node.data = {
      ...node.data,
      markdown: {
        content: data.text,
      },
    };
  } else if (block_type === BlockType.Shell) {
    node.data = {
      ...node.data,
      shell: {
        prompt: data.prompt || '',
        text: data.command || '',
      },
    };
  } else if (block_type === BlockType.Database) {
    node.data = {
      ...node.data,
      database: {
        databaseServer: data.database_id || '',
        text: data.query || '',
      },
    };
  } else if (block_type === BlockType.Rest) {
    node.data = {
      ...node.data,
      api: {
        providerId: data.api_provider_id || '',
        httpMethod: data.http_method,
        path: data.api_path || '',
        headers: data.headers || [],
        queryParameters: data.query_parameters || [],
      },
    };
  } else if (block_type === BlockType.Form) {
    node.data = {
      ...node.data,
      form: (data.form_fields || []).map((field) => ({
        name: field.name,
        id: nanoid(),
        type: field.type,
        options: field.options,
      })),
    };
  }

  return node;
};

export const transformAllApiBlocksToNode = (blocks: AllBlocks[]) =>
  blocks.map((node, i) => transformApiBlockToNode(node, i, blocks.length));

export const transformRunResultData = (
  result: INodeRunResultData,
  nodes: INodeAction[],
) => {
  const results = [];
  for (let i = 0; i < nodes.length; i += 1) {
    let success = false;
    let output = '';
    const thisNode = nodes[i];
    const id = parseInt(thisNode.id, 10);
    if (thisNode.data.shell) {
      const {
        stdout_exit_status: stoutExitStatus,
        stdout,
        stderr,
      } = result[id];
      success = stoutExitStatus === 0;
      output = stdout || stderr || '';
    } else if (thisNode.data.database) {
      const { exit_status: exitStatus, output: databaseOutput } = result[id];
      success = exitStatus === 0;
      output = databaseOutput || '';
    } else {
      continue;
    }

    results.push({ success, output, id });
  }
  return results;
};
