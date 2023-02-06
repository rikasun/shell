import { ComponentStory, ComponentMeta } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from './table';

export default {
  component: Table,
  title: 'Table',
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = (args) => <Table {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: (
    <>
      <TableHead>
        <TableRow display="head">
          <TableHeadCell>Column A</TableHeadCell>
          <TableHeadCell>Column B</TableHeadCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow>
          <TableCell>Cell A</TableCell>
          <TableCell>Cell B</TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Cell C</TableCell>
          <TableCell>Cell D</TableCell>
        </TableRow>
      </TableBody>
    </>
  ),
};

/**
 * You should always include a header row, even if it's visually hidden.
 */
export const WithoutHeader = Template.bind({});
WithoutHeader.args = {
  children: (
    <>
      <TableHead hide>
        <TableRow display="head">
          <TableHeadCell>Column A</TableHeadCell>
          <TableHeadCell>Column B</TableHeadCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow noHeader>
          <TableCell>Cell A</TableCell>
          <TableCell>Cell B</TableCell>
        </TableRow>

        <TableRow noHeader>
          <TableCell>Cell C</TableCell>
          <TableCell>Cell D</TableCell>
        </TableRow>
      </TableBody>
    </>
  ),
};
