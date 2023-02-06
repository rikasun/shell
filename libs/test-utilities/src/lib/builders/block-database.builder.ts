import { BlockType, IBlockDatabase } from '@cased/data';

export class BlockDatabaseBuilder {
  private name = 'Lorem Ipsum';
  private id = 1;
  private databaseId = '1';

  build(): IBlockDatabase {
    return {
      id: this.id,
      name: this.name,
      block_type: BlockType.Database,
      runbook_id: '1',
      sort_order: 1,
      data: {
        database_id: this.databaseId,
        query: 'SELECT * FROM users',
      },
    };
  }

  withName(name: string): BlockDatabaseBuilder {
    this.name = name;

    return this;
  }

  withId(id: number): BlockDatabaseBuilder {
    this.id = id;

    return this;
  }

  withDatabaseId(databaseId: string): BlockDatabaseBuilder {
    this.databaseId = databaseId;

    return this;
  }
}
