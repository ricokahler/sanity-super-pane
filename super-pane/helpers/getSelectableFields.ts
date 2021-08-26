export function getSelectableFields(fields: Array<any> = []) {
  if (!fields.length) return [];

  return fields.reduce((acc: any, cur: any) => {
    const fieldPath: string = cur.name;
    const title: string = cur.type.title;
    const fields = [{ field: cur, fieldPath, title, level: 0 }];

    if (cur.type?.fields?.length) {
      const innerFields = cur.type.fields.map((inner: any) => ({
        field: inner,
        fieldPath: fieldPath + '.' + inner.name,
        title: inner.type.title,
        level: 1,
      }));

      fields.push(...innerFields);
    }

    return [...acc, ...fields];
  }, []);
}
