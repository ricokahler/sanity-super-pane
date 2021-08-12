import S from '@sanity/desk-tool/structure-builder';
import { createSuperPane } from './super-pane';

export default () =>
  S.list()
    .title('TESTING')
    .items([
      S.listItem().title('Normal List').child(createSuperPane('movie', S)),
    ]);
