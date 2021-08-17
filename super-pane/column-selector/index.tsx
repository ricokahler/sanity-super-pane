import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, Checkbox, Button } from '@sanity/ui';
import { nanoid } from 'nanoid';
import styles from './styles.module.css';
import { Field } from '../types/Field';

interface Props {
  typeName: string;
  open: boolean;
  onClose: () => void;
  onSelect: (selectedColumns: Map<string, Field>) => void;
  initiallySelectedColumns: Map<string, Field>;
  fields: Map<string, Field>
}

function ColumnSelector({
  open,
  onClose,
  onSelect,
  initiallySelectedColumns,
  fields,
}: Props) {
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
                setSelectedColumns((map) => {
                  const nextMap = new Map(map);

                  if (map.has('_updatedAt')) {
                    nextMap.delete('_updatedAt');
                  } else {
                    nextMap.set('_updatedAt', { title: 'Updated at', name: '_updatedAt', type: 'number' });
                  }

                  return nextMap;
                });
              }}
            />
            <span>Updated At</span>
          </label>
        </li>
        {Array.from(fields.values()).map((field) => {
          return (
            <li key={field.name}>
              <label className={styles.label}>
                <Checkbox
                  className={styles.checkbox}
                  checked={selectedColumns.has(field.name)}
                  onChange={() => {
                    console.log(field)
                    setSelectedColumns((map) => {
                      const nextMap = new Map(map);

                      if (map.has(field.name)) {
                        nextMap.delete(field.name);
                      } else {
                        nextMap.set(field.name, field);
                      }
                      return nextMap;
                    });
                  }}
                />
                <span>{field.title}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

export default ColumnSelector;
