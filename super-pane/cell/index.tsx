import React from 'react';
import SanityPreview from 'part:@sanity/base/preview';
import blockContentToString from '../block-content-to-string';
import styles from './styles.module.css';

interface Props {
  field: any;
  value: any;
}

function Cell({ field, value }: Props) {
  switch (field.type.name) {
    case 'string':
    case 'number': {
      return <td key={field.name}>{value}</td>;
    }
    case 'blockContent': {
      const blockContentAsString = blockContentToString(value);

      return (
        <td
          title={blockContentAsString}
          key={field.name}
          className={styles.blockContent}
        >
          {blockContentAsString}
        </td>
      );
    }
    case 'datetime': {
      return (
        <td key={field.name}>
          {value ? new Date(value).toLocaleString() : ''}
        </td>
      );
    }
    case 'date': {
      return (
        <td key={field.name}>
          {value ? new Date(value).toLocaleDateString() : ''}
        </td>
      );
    }
    case 'array': {
      return (
        <td key={field.name}>
          {value?.length || 0} item
          {value?.length === 1 ? '' : 's'}
        </td>
      );
    }
    default: {
      return (
        <td key={field.name}>
          {value && (
            <SanityPreview type={field.type} layout="default" value={value} />
          )}
        </td>
      );
    }
  }
}

export default Cell;
