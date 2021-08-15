import { TextInput } from '@sanity/ui'
import React, { useEffect, useState } from 'react'
import FieldToSearchFor from './FieldToSearchFor';
import SelectFieldToSearchFor from './select-field-to-search-for'
import styles from './styles.module.css';

interface SearchFieldProps {
  searchCallback: (userQuery: string) => void
  fieldsToChooseFrom: FieldToSearchFor[],
  currentField: FieldToSearchFor,
  onFieldSelected: (field: FieldToSearchFor) => void
}

let timeout: NodeJS.Timeout

const SearchField: React.FC<SearchFieldProps> = ({ searchCallback, currentField, fieldsToChooseFrom, onFieldSelected }) => {
  const [userQuery, setUserQuery] = useState('')

  useEffect(() => {
    if (timeout) clearTimeout(timeout)
    if (!userQuery.length) return searchCallback('')
    timeout = setTimeout(() => {
      searchCallback(userQuery)
    }, 700)
    return () => clearTimeout(timeout)
  }, [userQuery, searchCallback])

  return <div className={styles.searchField}>
    <TextInput
      fontSize={[2, 2, 3, 4]}
      onChange={(event) =>
        setUserQuery(event.currentTarget.value)
      }
      padding={[3, 3, 4]}
      placeholder="Search"
      value={userQuery}
      className={styles.searchInput}
    />
    <SelectFieldToSearchFor
      currentField={currentField}
      onFieldSelected={onFieldSelected}
      fieldsToChooseFrom={fieldsToChooseFrom}
    />
  </div>
}

export default SearchField