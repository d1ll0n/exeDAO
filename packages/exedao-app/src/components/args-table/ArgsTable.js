import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

export default function ArgsTable({classes, functionSelector, parsedArgs}) {
  return (
    <div className={classes.root}>
      <Typography variant='h5'>Function {functionSelector}</Typography>
      <Typography variant='subtitle1'>Function Arguments</Typography>
      <Table>
        <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Argument Name</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
          {
            parsedArgs.map(({name, type, value}, i) =>
              <TableRow key={i}>
                <TableCell>{name}</TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>)
          }
        </TableBody>
      </Table>
    </div>
  )
}

