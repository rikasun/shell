import {
  BlockType,
  FieldType,
  IBlockForm,
  IBlockFormField,
  IFormOption,
} from '@cased/data';

export class BlockFormBuilder {
  private name = 'Lorem Ipsum';
  private id = 1;
  private fields: IBlockFormField[] = [];

  build(): IBlockForm {
    return {
      id: this.id,
      name: this.name,
      block_type: BlockType.Form,
      runbook_id: '1',
      sort_order: 1,
      data: {
        form_fields: this.fields,
      },
    };
  }

  withName(name: string): BlockFormBuilder {
    this.name = name;

    return this;
  }

  // istanbul ignore next
  withField(
    name: string,
    type: FieldType,
    options: IFormOption[] = [],
  ): BlockFormBuilder {
    this.fields.push({
      name,
      type,
      options,
    });

    return this;
  }

  withId(id: number): BlockFormBuilder {
    this.id = id;

    return this;
  }
}
