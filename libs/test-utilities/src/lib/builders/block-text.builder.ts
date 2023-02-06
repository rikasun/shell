import { BlockType, IBlockText } from '@cased/data';

export class BlockTextBuilder {
  private name = 'Lorem Ipsum';
  private id = 1;

  build(): IBlockText {
    return {
      id: this.id,
      name: this.name,
      block_type: BlockType.Text,
      runbook_id: '1',
      sort_order: 1,
      data: {
        text: 'Hello World',
      },
    };
  }

  withName(name: string): BlockTextBuilder {
    this.name = name;

    return this;
  }

  withId(id: number): BlockTextBuilder {
    this.id = id;

    return this;
  }
}
