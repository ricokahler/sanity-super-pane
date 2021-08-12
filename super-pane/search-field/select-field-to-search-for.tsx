import { MenuButton, Button, Menu, MenuItem } from '@sanity/ui';
import React from 'react';
import FieldToSearchFor from './FieldToSearchFor';

interface SelectFieldToSearchForProps {
  currentField: FieldToSearchFor,
  fieldsToChooseFrom: FieldToSearchFor[],
  onFieldSelected: (field: FieldToSearchFor) => void
}

const SelectFieldToSearchFor: React.FC<SelectFieldToSearchForProps> = ({ currentField, onFieldSelected, fieldsToChooseFrom }) => {

    return (
      <MenuButton
        button={<Button text={currentField.title} />}
        id="select-field-to-search-for"
        menu={(
          <Menu>
            {fieldsToChooseFrom.map((field) => (
              <MenuItem 
                key={`fieldToSearchForOption - ${field.name}`} 
                text={field.title} 
                onClick={() => onFieldSelected(field)} 
              />
            ))}
          </Menu>
        )}
        placement="left"
        popover={{portal: true}}
      />
    );
};

export default SelectFieldToSearchFor;