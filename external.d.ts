declare module 'part:*';

declare module '*.module.css' {
  const content: {
    [identifier: string]: any;
  };
  export = content;
}
