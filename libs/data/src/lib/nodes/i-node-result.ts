export interface INodeRunResultData {
  [key: number]: {
    stdout_exit_status?: number;
    stderr_exit_status?: number;
    stdout?: string;
    stderr?: string;
    output?: string;
    exit_status?: number;
  };
}
