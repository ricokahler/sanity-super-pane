import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, Checkbox, Button } from '@sanity/ui';
import { nanoid } from 'nanoid';
import schema from 'part:@sanity/base/schema';
import styles from './styles.module.css';

interface Props {
  typeName: string;
  open: boolean;
  onClose: () => void;
  onSelect: (selectedColumns: Set<string>) => void;
  initiallySelectedColumns: Set<string>;
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
    initiallySelectedColumns,
  );

  useEffect(() => {
    if (open) {
      setSelectedColumns(initiallySelectedColumns);
    }
  }, [open, initiallySelectedColumns]);

  const dialogId = useMemo(() => nanoid(), []);
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
              onChange={() => {
                setSelectedColumns((set) => {
                  const nextSet = new Set(set);

                  if (set.has('_updatedAt')) {
                    nextSet.delete('_updatedAt');
                  } else {
                    nextSet.add('_updatedAt');
                  }

                  return nextSet;
                });
              }}
            />
            <span>Updated At</span>
          </label>
        </li>
        {schemaType.fields.map((i: any) => {
          const fieldName: string = i.name;
          const title: string = i.type.title;

          return (
            <li key={fieldName}>
              <label className={styles.label}>
                <Checkbox
                  className={styles.checkbox}
                  checked={selectedColumns.has(fieldName)}
                  onChange={() => {
                    setSelectedColumns((set) => {
                      const nextSet = new Set(set);

                      if (set.has(fieldName)) {
                        nextSet.delete(fieldName);
                      } else {
                        nextSet.add(fieldName);
                      }

                      return nextSet;
                    });
                  }}
                />
                <span>{title}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

export default ColumnSelector;
