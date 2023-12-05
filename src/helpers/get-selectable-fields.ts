import { SelectableField } from '../column-selector';

function getInnerFields(
  childFields: any[],
  parentPath: string,
  currentLevel = 1
): SelectableField[] {
  return childFields.reduce((acc: any, cur: any) => {
    const fieldPath = parentPath + '.' + cur.name;
    const level = currentLevel + 1;

    const child = {
      field: cur,
      fieldPath,
      title: cur.type.title,
      level,
      sortable: true,
    };

    if (cur.type?.fields?.length) {
      child.sortable = false;
      const children = cur.type.fields;
      const innerFields = getInnerFields(children, fieldPath, level);

      if (innerFields.length) {
        return [...acc, child, ...innerFields];
      }
    }

    return [...acc, child];
  }, []);
}

export function getSelectableFields(
  fields: Array<any> = []
): SelectableField[] {
  if (!fields.length) return [];

  const selectable = fields.reduce((acc: any, cur: any) => {
    const fieldPath: string = cur.name;
    const title: string = cur.type.title;
    const parent = { field: cur, fieldPath, title, level: 0, sortable: true };

    if (cur.type?.fields?.length) {
      parent.sortable = false;
      const children = cur.type.fields;
      const innerFields = getInnerFields(children, fieldPath, 1);

      if (innerFields.length) {
        return [...acc, parent, ...innerFields];
      }
    }

    return [...acc, parent];
  }, []);

  return selectable;
}
