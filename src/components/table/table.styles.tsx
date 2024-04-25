import {Box} from '@sanity/ui'
import styled from 'styled-components'

export const StyledCell = styled.td`
  display: table-cell;
  text-align: left;
`

export const StyledHeaderGroup = styled.thead`
  display: table-header-group;
  text-align: left;

  td,
  th {
    padding: 1rem 0;
  }
`

export const StyledRowGroup = styled.tbody`
  display: table-row-group;
  text-align: left;
`

export const StyledRow = styled.tr`
  display: table-row;
  text-align: left;

  > td {
    border-top: 1px solid var(--card-border-color);
    padding: 1rem 0;
  }
`

export const StyledTable = styled(Box).attrs({as: 'table'})`
  display: table-table;
  table-layout: auto;
  width: 100%;
`
