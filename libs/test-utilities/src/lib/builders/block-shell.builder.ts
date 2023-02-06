import { BlockType, IBlockShell } from '@cased/data';

export class BlockShellBuilder {
  private name = 'Lorem Ipsum';
  private id = 1;
  private prompt = 'demo';

  build(): IBlockShell {
    return {
      id: this.id,
      name: this.name,
      block_type: BlockType.Shell,
      runbook_id: '1',
      sort_order: 1,
      data: {
        command: 'echo "Hello World"',
        prompt: this.prompt,
      },
    };
  }

  withName(name: string): BlockShellBuilder {
    this.name = name;

    return this;
  }

  withId(id: number): BlockShellBuilder {
    this.id = id;

    return this;
  }

  withPrompts(prompt: string): BlockShellBuilder {
    this.prompt = prompt;

    return this;
  }
}
