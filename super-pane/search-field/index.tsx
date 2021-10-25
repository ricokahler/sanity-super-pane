import { TextInput, Select } from '@sanity/ui';
import React, { useEffect, useState } from 'react';
import { Field } from '../types/Field';
import styles from './styles.module.css';

interface Props {
  currentField?: string;
  onSearch: (userQuery: string) => void;
  onFieldSelected: (field: string) => void;
  searchableFields: Field[]
}

function SearchField({
  currentField,
  searchableFields,
  onSearch,
  onFieldSelected,
}: Props) {
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    if (!userQuery.length) {
      onSearch('');
      return;
    }

    const timeout = setTimeout(() => {
      onSearch(userQuery);
    }, 700);

    return () => clearTimeout(timeout);
  }, [userQuery, onSearch]);

  return (
    <form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>
      <TextInput
        onChange={(event) => setUserQuery(event.currentTarget.value)}
        placeholder="Search"
        value={userQuery}
      />

      <div className={styles.searchSelect}>
        <Select
          value={localStorage.getItem("super_pane_key") || undefined}
          onChange={(e) => localStorage.setItem("super_pane_key", e.currentTarget.value)}
        >
          {searchableFields.map((field) => (
            <option key={field.name} value={field.name}>
              {field.title}
            </option>
          ))}
        </Select>
      </div>
    </form>
  );
}

export default SearchField;
