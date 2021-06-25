# _SUPER_ Pane

> The Sanity Desk Tool Pane with Super Powers

![CleanShot 2021-03-25 at 09 00 11](https://user-images.githubusercontent.com/10551026/112476955-d2479380-8d48-11eb-842e-15f0674d29d4.gif)

**Status:** ⚠️ MVP/EARLY ALPHA. There is [much more (eventually)](https://github.com/ricokahler/sanity-super-pane/issues/2) planned for this thing. Stay tuned/Watch Releases to be notifed with updates.

[Please report bugs](/issues)!

## What

Super Pane aims to replace the traditional document type list pane in the Sanity Studio for certain documents that need more editing power. The goal of Super Pane is to enable more bulk editing and quick scanning while not losing any of the live-edit/reactivity of Sanity.

Super Pane aims to feel Sanity-y via [`@sanity/ui`](https://www.sanity.io/ui) other integrations.

## Installation

```
# note: the alpha tag is needed at this time
yarn add sanity-super-pane@alpha
```

Then integrate Super Pane using the [structure builder](https://www.sanity.io/docs/structure-builder-introduction):

```js
import S from '@sanity/desk-tool/structure-builder';
import { createSuperPane } from 'sanity-super-pane';

export default () =>
  S.list()
    .title('Base')
    .items([
      S.listItem().title('Normal List').child(createSuperPane('movie', S)),
    ]);
```
