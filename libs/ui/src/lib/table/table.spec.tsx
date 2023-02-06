import { render } from '@testing-library/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from './table';

describe('Table', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Table>
        <TableHead>
          <TableRow display="head">
            <TableHeadCell>Column A</TableHeadCell>
            <TableHeadCell>Column B</TableHeadCell>
          </TableRow>
        </TableHead>

        <TableBody className="bg-white">
          <TableRow>
            <TableCell>Cell A</TableCell>
            <TableCell>Cell B</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>Cell C</TableCell>
            <TableCell>Cell D</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(baseElement).toBeTruthy();
  });
});
