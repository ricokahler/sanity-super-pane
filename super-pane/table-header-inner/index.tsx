import React from 'react';
import { Label, Flex } from '@sanity/ui';
import { ChevronDownIcon, ChevronUpIcon, SortIcon } from '@sanity/icons';

import { SelectableField } from '../column-selector/index';

export default function TableHeaderInner({
  field,
  orderColumn,
}: {
  field: SelectableField;
  orderColumn: any;
}) {
  return (
    <Flex align="center">
      <Label muted={!field.sortable}>{field.title}</Label>
      {field.sortable && (
        <>
          {orderColumn.key === field.fieldPath ? (
            <>
              {orderColumn.direction === 'asc' ? (
                <ChevronDownIcon />
              ) : (
                <ChevronUpIcon />
              )}
            </>
          ) : (
            <>
              <SortIcon />
            </>
          )}
        </>
      )}
    </Flex>
  );
}
