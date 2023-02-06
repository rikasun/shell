import { BlockType, HttpMethod, IBlockRest, IFormOption } from '@cased/data';

export class BlockRestBuilder {
  private name = 'Rest';
  private id = 1;
  private apiProviderId = '1';
  private headers: IFormOption[] = [];

  build(): IBlockRest {
    return {
      id: this.id,
      name: this.name,
      block_type: BlockType.Rest,
      runbook_id: '1',
      sort_order: 1,
      data: {
        query_parameters: [],
        headers: this.headers,
        http_method: HttpMethod.GET,
        api_path: '',
        api_provider_id: this.apiProviderId,
        text: '',
      },
    };
  }

  withName(name: string): BlockRestBuilder {
    this.name = name;

    return this;
  }

  withId(id: number): BlockRestBuilder {
    this.id = id;

    return this;
  }

  withApiProviderId(apiProviderId: string): BlockRestBuilder {
    this.apiProviderId = apiProviderId;

    return this;
  }

  withHeader(id: string, label: string, value: string): BlockRestBuilder {
    this.headers.push({ id, label, value });

    return this;
  }
}
