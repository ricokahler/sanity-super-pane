import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, Checkbox, Button } from '@sanity/ui';
import { uuid } from '@sanity/uuid';;
import {useSchema} from 'sanity';
import { getSelectableFields } from '../helpers/get-selectable-fields';

interface Props {
  typeName: string;
  open: boolean;
  onClose: () => void;
  onSelect: (selectedColumns: Set<string>) => void;
  initiallySelectedColumns: Set<string>;
}

export interface SelectableField {
  field: any;
  fieldPath: string;
  title: string;
  level: number;
  sortable: boolean;
}

function ColumnSelector({
  open,
  onClose,
  onSelect,
  typeName,
  initiallySelectedColumns,
}: Props) {
  const schema = useSchema();
  const schemaType = schema.get(typeName);
  const [selectedColumns, setSelectedColumns] = useState(
    initiallySelectedColumns
  );

  useEffect(() => {
    if (open) {
      setSelectedColumns(initiallySelectedColumns);
    }
  }, [open, initiallySelectedColumns]);

  const dialogId = useMemo(uuid, []);

  function handleSelect(fieldPath: string) {
    setSelectedColumns((set) => {
      const nextSet = new Set(set);

      if (set.has(fieldPath)) {
        nextSet.delete(fieldPath);
      } else {
        nextSet.add(fieldPath);
      }

      return nextSet;
    });
  }

  const selectableFields = useMemo(
    () => {
      if (!schemaType || !('fields' in schemaType)) {
        return [];
      }

      return getSelectableFields(schemaType.fields || [])
    },
    [schemaType]
  );

  if (!open) {
    return null;
  }

  return (
    <Dialog
      className={'dialog'}
      header={<>Select Columns</>}
      footer={
        <div className={'footer'}>
          <Button mode="ghost" text="Cancel" onClick={onClose} />
          <Button
            tone="primary"
            text="Apply"
            onClick={() => {
              onClose();
              onSelect(selectedColumns);
            }}
          />
        </div>
      }
      id={dialogId}
      onClose={onClose}
      zOffset={100000}
    >
      <ul className={'list'}>
        <li>
          <label className={'label'}>
            <Checkbox
              className={'checkbox'}
              checked={selectedColumns.has('_updatedAt')}
              onChange={() => handleSelect('_updatedAt')}
            />
            <span>Updated At</span>
          </label>
        </li>
        {selectableFields.map(
          ({ fieldPath, title, level }: SelectableField) => (
            <li key={fieldPath} style={{ marginLeft: level * 10 }}>
              <label className={'label'}>
                <Checkbox
                  className={'checkbox'}
                  checked={selectedColumns.has(fieldPath)}
                  onChange={() => handleSelect(fieldPath)}
                />
                <span>{title}</span>
              </label>
            </li>
          )
        )}
      </ul>
    </Dialog>
  );
}

export default ColumnSelector;
