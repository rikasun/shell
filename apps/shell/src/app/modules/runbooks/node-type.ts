export enum NodeType {
  None = 'None',
  Markdown = 'markdown',
  Form = 'form',
  Rest = 'rest',
  Database = 'database',
  Shell = 'shell',
}

export const stringToNodeType = (key: string | null): NodeType => {
  switch (key) {
    case 'markdown':
      return NodeType.Markdown;
    case 'form':
      return NodeType.Form;
    case 'rest':
      return NodeType.Rest;
    case 'database':
      return NodeType.Database;
    case 'shell':
      return NodeType.Shell;
    default:
      return NodeType.None;
  }
};
