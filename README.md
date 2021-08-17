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

## Local development

Here is the first time setup for this lib:

### Install

First, clone the repo (or a fork), and then install with npm

> Note: installing with npm instead of yarn is required.

```
npm i
```

### Create a sample project with the movie dataset

The login into the sanity CLI

```
npx sanity login
```

Then create a temporary project via the CLI. We'll use this create project entry in your Sanity account with the example movie dataset.

```
npx sanity init -y \
  --create-project "super-pane-dev" \
  --dataset production \
  --visibility private \
  --template moviedb \
  --output-path ./temp-movie-project
```

After this is done grab the project ID:

```
cat ./temp-movie-project/sanity.json | grep projectId
```

Then you create a .env.development file for development:

```
echo SANITY_STUDIO_API_PROJECT_ID="ENTER_PROJECT_ID" > .env.development
```

Finally delete the `temp-movie-project` folder.

### Start the dev server

```
npm start
```

## Contributing

1. Open an [issue](/issues) first so we can quickly align on the what and how.
2. Fork this repo to your own Github account or org.
3. Create a new branch (e.g. `feat/new-feature`, `fix/the-bug`, etc) and commit following the [Angular Commit Message Conventions](https://github.com/semantic-release/semantic-release#commit-message-format). This is important because this repo is managed via [semantic-release](https://github.com/semantic-release/semantic-release). Semantic-release parses these messages to determine version numbers.
