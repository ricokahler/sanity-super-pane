import S from '@sanity/desk-tool/structure-builder';
import React from 'react'
import { createSuperPane } from './super-pane';

const customColumns = [
  {
    title: 'Title 2',
    name: 'title2',
    type: 'string',
    query: "title"
  },
  {
    title: 'Cast Members',
    name: 'castMembers',
    type: 'number',
    query: "count(castMembers)",
    component: ({ castMembers }) => <div style={{ color: 'green' }}>{castMembers}</div>
  }
]

export default () =>
  S.list()
    .title('Base')
    .items([
      S.listItem().title('Normal List').child(createSuperPane('movie', S, customColumns)),
    ]);
