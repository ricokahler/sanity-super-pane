import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, Checkbox, Button } from '@sanity/ui';
import { nanoid } from 'nanoid';
import schema from 'part:@sanity/base/schema';
import styles from './styles.module.css';
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
  const schemaType = schema.get(typeName);
  const [selectedColumns, setSelectedColumns] = useState(
    initiallySelectedColumns
  );

  useEffect(() => {
    if (open) {
      setSelectedColumns(initiallySelectedColumns);
    }
  }, [open, initiallySelectedColumns]);

  const dialogId = useMemo(() => nanoid(), []);

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
    () => getSelectableFields(schemaType.fields),
    [schemaType.fields]
  );

  if (!open) {
    return null;
  }

  return (
    <Dialog
      className={styles.dialog}
      header={<>Select Columns</>}
      footer={
        <div className={styles.footer}>
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
      <ul className={styles.list}>
        <li>
          <label className={styles.label}>
            <Checkbox
              className={styles.checkbox}
              checked={selectedColumns.has('_updatedAt')}
              onChange={() => handleSelect('_updatedAt')}
            />
            <span>Updated At</span>
          </label>
        </li>
        {selectableFields.map(
          ({ fieldPath, title, level }: SelectableField) => (
            <li key={fieldPath} style={{ marginLeft: level * 10 }}>
              <label className={styles.label}>
                <Checkbox
                  className={styles.checkbox}
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
