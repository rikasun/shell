import { action, computed } from 'easy-peasy';
import { Panel, RunbookMode } from '@cased/data';
import type { IRunbookStore } from './i-runbook-store';
import {
  createAllEdges,
  createEdge,
  updateNodePositions,
} from './runbooks-store-helpers';
import { runbooksThunks } from './runbooks.thunks';

/**
 * @TODO Consider breaking into a runbook data, node data, and runbook page store
 */
export const runbooksStore: IRunbookStore = {
  mode: RunbookMode.Edit,
  id: undefined,
  name: '',
  edges: [],
  nodes: [],
  prompts: [],
  databases: [],
  apiProviders: [],
  activeNodeId: undefined,
  panel: Panel.None,
  isFormDirty: false,
  focusNodeId: undefined,

  /**
   * @TODO Needs a guard that automatically resets this state on specific pages via a reset() action
   */
  isPopulateCompleted: false,

  activeNode: computed((state) =>
    state.nodes.find(({ id }) => id === state.activeNodeId),
  ),

  focusNode: computed((state) =>
    state.nodes.find(({ id }) => id === state.focusNodeId),
  ),

  setMode: action((state, { mode }) => {
    state.mode = mode;
  }),

  setActiveNodeId: action((state, { id }) => {
    state.activeNodeId = id;
    state.nodes.forEach((node) => {
      node.data.selected = node.id === id;
    });
  }),

  clearSelection: action((state) => {
    state.activeNodeId = undefined;
  }),

  clearAll: action((state) => {
    state.mode = RunbookMode.Edit;
    state.id = undefined;
    state.name = '';
    state.edges = [];
    state.nodes = [];
    state.prompts = [];
    state.databases = [];
    state.apiProviders = [];
    state.activeNodeId = undefined;
    state.isPopulateCompleted = false;
    state.panel = Panel.None;
    state.isFormDirty = false;
  }),

  setIsPopulateCompleted: action((state, { complete }) => {
    state.isPopulateCompleted = complete;
  }),

  setPanel: action((state, { panel }) => {
    state.panel = panel;
  }),

  addNode: action((state, { id, node, nodeParentId }) => {
    let position = state.nodes.length;
    if (nodeParentId) {
      position =
        state.nodes.findIndex(({ id: target }) => target === nodeParentId) + 1;
    }

    const newNode = {
      id,
      type: 'action',
      data: {
        ...node,
        handleBeginHide: false,
        handleEndHide: position === state.nodes.length,
        hasDelete: true,
      },
      position: {
        x: 0,
        y: 0,
      },
    };

    state.nodes.splice(position, 0, newNode);

    const prev = state.nodes.length ? state.nodes[position - 1] : undefined;
    if (prev) {
      prev.data.handleEndHide = false;
      state.edges = state.edges.filter(({ source }) => source !== prev.id);
      state.edges.push(createEdge(prev.id, newNode.id));
    }

    updateNodePositions(state.nodes);

    if (nodeParentId) {
      const next = state.nodes[position + 1];
      state.edges.push(createEdge(newNode.id, next.id));
    }

    state.focusNodeId = id;
  }),

  removeNodeById: action((state, payload) => {
    const nodeId = payload.id;
    const node = state.nodes.find(({ id }) => id === nodeId);
    if (!node) throw new Error(`Failed to find node id ${nodeId}`);

    state.nodes = state.nodes.filter(({ id }) => id !== nodeId);
    state.edges = createAllEdges(state.nodes);
    updateNodePositions(state.nodes);
  }),

  setNodeById: action((state, { node }) => {
    const newNodes = [...state.nodes];
    const index = state.nodes.findIndex(({ id }) => id === node.id);
    newNodes[index] = node;

    state.nodes = newNodes;
  }),

  setFormDirty: action((state, { dirty }) => {
    state.isFormDirty = dirty;
  }),

  set: action(
    (state, { id, name, nodes, edges, prompts, apiProviders, databases }) => {
      state.id = id;
      state.name = name;
      state.nodes = [...nodes];
      state.edges = [...edges];
      state.apiProviders = [...apiProviders];
      state.prompts = [...prompts];
      state.databases = [...databases];
    },
  ),

  setFocusId: action((state, { id }) => {
    state.focusNodeId = id;
  }),

  ...runbooksThunks,
};
