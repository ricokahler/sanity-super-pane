import React from 'react';
import SanityPreview from 'part:@sanity/base/preview';
import blockContentToString from '../block-content-to-string';
import styles from './styles.module.css';
import { Field } from '../types/Field';
import { Badge } from '@sanity/ui';

interface Props {
  field: Field;
  value: any;
}

function Cell({ field, value }: Props) {
  if (field.component) {
    const props = { [field.name]: value }
    return <td key={field.name}>
      <field.component {...props} />
    </td>
  }
  switch (field.type) {
    case 'boolean':
      return <td key={field.name}>
        <Badge
          size={1}
          tone={value ? 'positive' : 'caution'}
        >
          {value?.toString()}
        </Badge>
      </td>
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
