import { TextInput, Select } from '@sanity/ui';
import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface Props {
  fieldsToChooseFrom: Array<{ name: string; title: string }>;
  currentField: string | null;
  onSearch: (userQuery: string) => void;
  onFieldSelected: (field: string) => void;
}

function SearchField({
  currentField,
  fieldsToChooseFrom,
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
          value={currentField || undefined}
          onChange={(e) => onFieldSelected(e.currentTarget.value)}
        >
          {fieldsToChooseFrom.map((field) => (
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
