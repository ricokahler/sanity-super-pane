export interface Field {
  title: string,
  name: string,
  type: 'string' | 'number' | 'blockContent' | 'datetime' | 'date' | 'array' | string
  query?: string
  component?: React.FC<{[id: string]: any}>
}