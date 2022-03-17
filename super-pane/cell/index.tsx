import React from 'react';
import SanityPreview from 'part:@sanity/base/preview';
import blockContentToString from '../block-content-to-string';
import styles from './styles.module.css';
import { Text } from '@sanity/ui';

interface Props {
  field: any;
  fieldPath: string;
  value: any;
}

function Cell({ field, fieldPath, value }: Props) {
  switch (field.type.name) {
    // Hacky! Format _just_ the updatedAt field
    case '_updatedAt': {
      return (
        <td key={fieldPath}>
          <Text size={1}>{new Date(value).toLocaleString()}</Text>
        </td>
      );
    }
    // The rest of these types are legit!
    case 'string':
    case 'number': {
      return <td key={fieldPath}>{value}</td>;
    }
    case 'blockContent': {
      const blockContentAsString = blockContentToString(value);

      return (
        <td
          title={blockContentAsString}
          key={fieldPath}
          className={styles.blockContent}
        >
          {blockContentAsString}
        </td>
      );
    }
    case 'datetime': {
      return (
        <td key={fieldPath}>{value ? new Date(value).toLocaleString() : ''}</td>
      );
    }
    case 'date': {
      return (
        <td key={fieldPath}>
          {value ? new Date(value).toLocaleDateString() : ''}
        </td>
      );
    }
    case 'array': {
      return (
        <td key={fieldPath}>
          {value?.length || 0} item
          {value?.length === 1 ? '' : 's'}
        </td>
      );
    }
    case 'boolean': {
      if (value == undefined){
        return (
          <td key={fieldPath}>
            {''}
          </td>
        );
      } 
      else {
        return (
          <td key={fieldPath}>
            {value == true ? 'true' : 'false'}
          </td>
        );
      }
    }
    default: {
      return (
        <td key={fieldPath}>
          {value && (
            <SanityPreview type={field.type} layout="default" value={value} />
          )}
        </td>
      );
    }
  }
}

export default Cell;
