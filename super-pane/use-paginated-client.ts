import { useState, useEffect, useCallback } from 'react';
import { debounceTime, tap } from 'rxjs/operators';
import { nanoid } from 'nanoid';
import client from './client';

export interface Cursor {
  results: any[];
  nextPage: () => Promise<Cursor>;
  previousPage: () => Promise<Cursor>;
  totalPages: number;
  page: number;
}

const removeDraftPrefix = (s: string) =>
  s.startsWith('drafts.') ? s.substring('drafts.'.length) : s;

interface Params {
  typeName: string;
  pageSize: number;
  selectedColumns: Set<string>;
  searchField: string | null;
}

function usePaginatedClient({
  typeName,
  pageSize,
  selectedColumns,
  searchField,
}: Params) {
  // the loading statuses are a set of strings
  // when it's empty, nothing is loading
  const [loadingStatuses, setLoadingStatuses] = useState(new Set<string>());
  const loading = loadingStatuses.size > 0;

  // stores the state for the total amount of de-duped documents
  const [total, setTotal] = useState(0);

  // uses the pageSize to calculate the total pages
  const totalPages = Math.ceil(total / pageSize);

  // stores the current set of active IDs on the page.
  // these are fed into the `useEffect` that creates the `results` state
  const [pageIds, setPageIds] = useState<string[]>([]);

  // the current page. changing this will trigger a re-fetch of the `pageIds`
  const [page, setPage] = useState(0);

  // the current result set
  const [results, setResults] = useState<any[]>([]);

  // used to force refresh. TODO: consider refactoring this
  const [refreshId, setRefreshId] = useState(nanoid());
  const refresh = useCallback(() => setRefreshId(nanoid()), []);

  const [userQuery, setUserQuery] = useState('');
  // Builds the string to use when a custom filter has been entered
  const searchQuery =
    userQuery.length && searchField
      ? ` && ${searchField} match "${userQuery}*"`
      : '';

  console.log({ searchQuery });

  // get total count
  useEffect(() => {
    let canceled = false;

    async function getTotalCount() {
      // add the `total_count` to the loading statuses
      setLoadingStatuses((prev) => {
        const next = new Set(prev);
        next.add('total_count');
        return next;
      });

      // fetch all the draft IDs in this document type
      const draftIds = await client.fetch<string[]>(
        `*[_type == $typeName && _id in path("drafts.**") ${searchQuery}]._id`,
        { typeName }
      );

      const { draftsWithPublishedVersion, notDraftCount } = await client.fetch<{
        // find all the documents with a corresponding published version
        draftsWithPublishedVersion: string[];
        // and also grab a count of how many documents aren't drafts
        notDraftCount: number;
      }>(
        `{
          "draftsWithPublishedVersion": *[_type == $typeName && _id in $ids ${searchQuery}]._id,
          "notDraftCount": count(*[_type == $typeName && !(_id in path("drafts.**")) ${searchQuery}]),
        }`,
        { ids: draftIds.map(removeDraftPrefix), typeName }
      );

      // the calculation for the total is then:
      const total =
        draftIds.length - draftsWithPublishedVersion.length + notDraftCount;

      // early return on canceled
      if (canceled) return;

      // remove `total_count` from the loading statuses
      setLoadingStatuses((prev) => {
        const next = new Set(prev);
        next.delete('total_count');
        return next;
      });

      setTotal(total);
    }

    getTotalCount().catch((e) => {
      // TODO: proper error handling
      console.warn(e);
    });

    return () => {
      canceled = true;
    };
  }, [typeName, refreshId, searchQuery]);

  // get page IDs
  useEffect(() => {
    const getPageIds = async (targetPage: number) => {
      // add the `page_ids` to the loading statuses
      setLoadingStatuses((prev) => {
        const next = new Set(prev);
        next.add('page_ids');
        return next;
      });

      // query for all the draft IDs
      const draftIds = await client.fetch<string[]>(
        `*[_type == $typeName && _id in path("drafts.**") ${searchQuery}]._id`,
        { typeName }
      );

      // create a set of drafts IDs.
      // these IDs are used to determine whether or a not a published version
      // should be ignored in order to favor the current draft version
      const drafts = draftIds.reduce((set, next) => {
        set.add(removeDraftPrefix(next));
        return set;
      }, new Set<string>());

      // this is a recursive function that will call itself until it reaches the
      // desired page.
      //
      // TODO: this implementation gets slower with each new page. pagination
      // is relatively challenging in this context since there could or could
      // not be a draft. The published version should be ignored to prefer the
      // draft which makes it hard to know where the current page ends and the
      // next one begins
      const getPage = async (start = 0, page = 0): Promise<string[]> => {
        const end =
          start +
          // note: we fetch twice the given page size to consider the cases
          // where we have to remove half the result set in the case of
          // duplicate `draft.` document
          pageSize * 2;

        const pageIds = await client.fetch<string[]>(
          `*[_type == $typeName ${searchQuery}][$start...$end]._id`,
          { typeName, start, end }
        );

        const filteredIds = pageIds
          .map((id, index) => ({ id, index: start + index }))
          .filter(({ id }) => {
            // if the id is a draft ID, we want to keep it
            if (id.startsWith('drafts.')) return true;

            // if the published _id exists in `drafts`, then there exists a draft
            // version of the current document and we should prefer that over the
            // published version
            if (drafts.has(id)) return false;

            return true;
          })
          .slice(0, pageSize);

        const ids = filteredIds.map((i) => i.id).map(removeDraftPrefix);
        if (page >= targetPage) return ids;

        const last = filteredIds[filteredIds.length - 1];
        if (!last) return [];

        return await getPage(last.index + 1, page + 1);
      };

      const ids = await getPage();

      // delete the `page_ids` from the loading statuses
      setLoadingStatuses((prev) => {
        const next = new Set(prev);
        next.delete('page_ids');
        return next;
      });

      return ids;
    };

    getPageIds(page)
      .then(setPageIds)
      .catch((e) => {
        // TODO: proper error handling
        console.warn(e);
      });
  }, [page, pageSize, typeName, refreshId, searchQuery]);

  // get results
  useEffect(() => {
    // take all the input IDs and duplicate them with the prefix `drafts.`
    const ids = pageIds.map((id) => [id, `drafts.${id}`]).flat();
    // these IDs will go into a specific query. if the draft or published
    // version happens to not exist, that's okay.
    const query = `*[_id in $ids ${searchQuery}] { _id, _type, ${Array.from(
      selectedColumns
    ).join(', ')} }`;

    async function getResults() {
      // add the `results` to the loading statuses
      setLoadingStatuses((prev) => {
        const next = new Set(prev);
        next.add('results');
        return next;
      });

      // create a dictionary of indexes where the keys are the IDs and the
      // values are the current index. this dictionary will be used to sort the
      // documents in their original order
      const indexes = pageIds.reduce<{ [id: string]: number }>(
        (acc, id, index) => {
          acc[id] = index;
          return acc;
        },
        {}
      );

      const results = await client.fetch<any[]>(query, { ids });

      // reduce the results into an accumulator by their normalized ID.
      // if there is a draft version, prefer the draft over the published
      const reducedResults = Object.values(
        results.reduce<{ [id: string]: any }>((acc, next) => {
          const id = removeDraftPrefix(next._id);
          const current = acc[id];

          const currentIsDraft = current?._id.startsWith('drafts.');
          const nextIsDraft = next?._id.startsWith('drafts.');

          const status =
            current && next
              ? 'draft'
              : currentIsDraft || nextIsDraft
              ? 'unpublished'
              : 'published';

          acc[id] = currentIsDraft ? current : next;
          acc[id]._status = status;
          acc[id]._normalizedId = id;

          return acc;
        }, {})
      );

      // delete the `results` from the loading statuses
      setLoadingStatuses((prev) => {
        const next = new Set(prev);
        next.delete('results');
        return next;
      });

      setResults(
        reducedResults
          .slice()
          // sort the accumulated version by their original index
          .sort(
            (a, b) =>
              indexes[removeDraftPrefix(a._id)] -
              indexes[removeDraftPrefix(b._id)]
          )
      );
    }

    // TODO: consider error handling
    getResults().catch((e) => {
      console.warn(e);
    });

    // TODO: add error handler
    const subscription = client
      .listen(query, { ids })
      .pipe(
        tap(() => {
          // add the `results` to the loading statuses
          setLoadingStatuses((prev) => {
            const next = new Set(prev);
            next.add('results');
            return next;
          });
        }),
        debounceTime(1000)
      )
      .subscribe(getResults);

    return () => subscription.unsubscribe();
  }, [pageIds, selectedColumns, refreshId, searchQuery]);

  // reset page
  useEffect(() => {
    // if the page is greater than the total pages then reset the page.
    // this could occur if the page size changed
    if (page >= totalPages) {
      setPage(0);
    }
  }, [page, totalPages]);

  return {
    results,
    page,
    totalPages,
    setPage,
    loading,
    pageIds,
    total,
    refresh,
    setUserQuery,
  };
}

export default usePaginatedClient;
