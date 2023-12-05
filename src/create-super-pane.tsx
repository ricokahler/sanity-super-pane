import { useMemo, useEffect, useState, useRef, isValidElement } from 'react';
import {usePaneRouter, type StructureBuilder} from 'sanity/desk';
// import S from '@sanity/desk-tool/structure-builder';
import { get } from 'lodash';
import classNames from 'classnames';
import {DocumentPreviewStore, PreviewValue, SanityDefaultPreview, SanityDocument, SchemaType, getPreviewStateObservable, getPreviewValueWithFallback, isRecord, useDocumentPreviewStore, useSchema} from 'sanity';
import {isNumber, isString} from 'lodash'
// import useRouter, { RouterProvider } from './use-router';
import BulkActionsMenu from './bulk-actions-menu';
import createEmitter from './create-emitter';
import usePaginatedClient from './use-paginated-client';
import ColumnSelector from './column-selector';
import Cell from './cell';
import {
  Card,
  Box,
  Text,
  Label,
  Button,
  Select,
  MenuButton,
  Menu,
  MenuItem,
  Checkbox,
  Badge,
  Flex,
} from '@sanity/ui';
import {
  EllipsisVerticalIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SyncIcon,
  SpinnerIcon,
  ControlsIcon,
  SearchIcon,
} from '@sanity/icons';
// import styles from './'module'.css';
import SearchField from './search-field';
import { useStickyStateSet } from './hooks/use-sticky-state-set';
import { useStickyStateOrder } from './hooks/use-sticky-state-order';
import { getSelectableFields } from './helpers/get-selectable-fields';
import { SelectableField } from './column-selector/index';
import TableHeaderInner from './table-header-inner';
import {useMemoObservable} from 'react-rx'

export interface PaneItemPreviewState {
  isLoading?: boolean
  draft?: PreviewValue | Partial<SanityDocument> | null
  published?: PreviewValue | Partial<SanityDocument> | null
}

export interface PaneItemPreviewProps {
  documentPreviewStore: DocumentPreviewStore
  schemaType: SchemaType
  value: SanityDocument
}

function parentHasClass(el: HTMLElement | null, className: string): boolean {
  if (!el) return false;
  if (el.classList.contains(className)) return true;
  return parentHasClass(el.parentElement, className);
}

function TitleCell(props: PaneItemPreviewProps) {
  const {value, schemaType} = props
  const title =
    (isRecord(value.title) && isValidElement(value.title)) ||
    isString(value.title) ||
    isNumber(value.title)
      ? value.title
      : null

  const {draft, published, isLoading} = useMemoObservable<PaneItemPreviewState>(
    () => getPreviewStateObservable(props.documentPreviewStore, schemaType, value._id, title),
    [props.documentPreviewStore, schemaType, value._id, title]
  )!

  return <SanityDefaultPreview
    schemaType={schemaType}
    layout="default"
    isPlaceholder={isLoading}
    {...getPreviewValueWithFallback({
      value,
      draft,
      published,
    })}
  />
}

function createSuperPane(typeName: string, S: StructureBuilder) {
  const selectColumns = createEmitter();
  const refresh = createEmitter();
  const search = createEmitter();

  const rowsPerPage = [25, 50, 100, 250, 500];
  const orderColumnDefault = { key: '', direction: 'asc' };

  function SuperPane() {
    const schema = useSchema();
    const schemaType = schema.get(typeName)!;
    const fieldsToChooseFrom = schemaType && 'fields' in schemaType ? (schemaType?.fields as any[])
      .filter((field: any) => field?.type?.jsonType === 'string')
      .map((field: any) => ({
        name: field.name as string,
        title: field.type.title as string,
      })) : [];
    const documentPreviewStore = useDocumentPreviewStore()
    const router = usePaneRouter();
    const [pageSize, setPageSize] = useState(rowsPerPage[0]);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useStickyStateSet(
      new Set<string>(),
      `super-pane-${typeName}-selected-columns`
    );
    const [orderColumn, setOrderColumn] = useStickyStateOrder(
      orderColumnDefault,
      `super-pane-${typeName}-order-column`
    );
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const [selectedSearchField, setSelectedSearchField] = useState<
      string | null
    >(fieldsToChooseFrom?.length ? fieldsToChooseFrom[0]?.name : null);
    const [showSearch, setShowSearch] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const client = usePaginatedClient({
      typeName,
      pageSize,
      selectedColumns,
      searchField: selectedSearchField,
      orderColumn,
    });

    useEffect(() => {
      return selectColumns.subscribe(() => setColumnSelectorOpen(true));
    }, []);

    useEffect(() => {
      return refresh.subscribe(client.refresh);
    }, [client.refresh]);

    useEffect(() => {
      return search.subscribe(() => setShowSearch((prev) => !prev));
    }, []);

    const defaultFields = selectedColumns.has('_updatedAt')
      ? [
          {
            fieldPath: '_updatedAt',
            title: 'Updated At',
            field: { type: { name: '_updatedAt' } },
            level: 0,
            sortable: true,
          },
        ]
      : [];
    const selectableFields = useMemo(
      () =>
        getSelectableFields(schemaType.fields).filter((field: any) =>
          selectedColumns.has(field.fieldPath)
        ),
      [selectedColumns]
    );
    const fields = [...defaultFields, ...selectableFields];

    const atLeastOneSelected = client.results.some((i) =>
      selectedIds.has(i._normalizedId)
    );

    const allSelected = client.results.every((i) =>
      selectedIds.has(i._normalizedId)
    );

    function handleOrder(key: string) {
      // Reset
      if (orderColumn.key === key && orderColumn.direction === 'desc') {
        return setOrderColumn(orderColumnDefault);
      }

      // Set updated key and/or direction
      setOrderColumn({
        key,
        direction:
          orderColumn?.direction === 'asc' && orderColumn.key === key
            ? 'desc'
            : 'asc',
      });
    }

    return (
      <>
        <div ref={containerRef} className={'container'}>
          <Card
            padding={3}
            tone={selectedIds.size < 1 ? `transparent` : `positive`}
            shadow={1}
          >
            <Flex align="center">
              <Button
                disabled={selectedIds.size < 1}
                onClick={() => setSelectedIds(new Set())}
                fontSize={1}
                paddingY={1}
                paddingX={2}
              >
                Clear
              </Button>
              <Box paddingX={2} style={{ marginRight: 'auto' }}>
                <Text size={1} weight="bold">
                  {selectedIds.size} item{selectedIds.size === 1 ? '' : 's'}{' '}
                  selected
                </Text>
              </Box>

              <BulkActionsMenu
                disabled={selectedIds.size < 1}
                className={'clearButton'}
                selectedIds={selectedIds}
                typeName={typeName}
                onDelete={() => {
                  setSelectedIds(new Set());
                  client.setPage(0);
                  client.refresh();
                }}
              />
            </Flex>
          </Card>
          {showSearch && (
            <div>
              <SearchField
                currentField={selectedSearchField}
                fieldsToChooseFrom={fieldsToChooseFrom}
                onSearch={client.setUserQuery}
                onFieldSelected={setSelectedSearchField}
              />
            </div>
          )}
          <div
            className={classNames('loadingOverlay', {
              ['loadingOverlayActive']: client.loading,
            })}
          >
            <SpinnerIcon className={'loadingSpinner'} />
          </div>
          <div className={'tableWrapper'}>
            <table className={'table'}>
              <thead className={'thead'}>
                <tr>
                  <th
                    className={classNames('checkboxCell', 'prevent-nav')}
                  >
                    <input
                      type="checkbox"
                      className={'hiddenCheckbox'}
                      onChange={() => {
                        setSelectedIds((set) => {
                          const nextSet = new Set(set);
                          if (allSelected) {
                            for (const result of client.results || []) {
                              nextSet.delete(result._normalizedId);
                            }
                          } else {
                            for (const result of client.results || []) {
                              nextSet.add(result._normalizedId);
                            }
                          }

                          return nextSet;
                        });
                      }}
                      checked={allSelected}
                    />
                    <div aria-hidden="true" className={'checkboxFacade'}>
                      <Checkbox
                        tabIndex={-1}
                        checked={atLeastOneSelected}
                        indeterminate={atLeastOneSelected && !allSelected}
                      />
                    </div>
                  </th>
                  <th style={{ paddingLeft: 0 }}>
                    <Label>{schemaType?.title || 'No title'}</Label>
                  </th>
                  <th>
                    <Label>Status</Label>
                  </th>
                  {fields.map((field: SelectableField) => (
                    <th key={field.fieldPath}>
                      {field.sortable ? (
                        <Button
                          mode={
                            orderColumn.key !== field.fieldPath
                              ? 'bleed'
                              : 'default'
                          }
                          tone={
                            orderColumn.key === field.fieldPath
                              ? 'primary'
                              : 'default'
                          }
                          padding={1}
                          onClick={() => handleOrder(field.fieldPath)}
                        >
                          <TableHeaderInner
                            field={field}
                            orderColumn={orderColumn}
                          />
                        </Button>
                      ) : (
                        <TableHeaderInner
                          field={field}
                          orderColumn={orderColumn}
                        />
                      )}
                    </th>
                  ))}
                  <th className={'optionsCell'} aria-label="Options" />
                </tr>
              </thead>

              <tbody className={'tbody'}>
                {client.results.map((item) => {
                  const handleNavigation = () => {
                    router.navigateIntent('edit', {
                        id: item._id,
                        type: item._type,
                    });
                  };

                  return (
                    <tr
                      key={item._normalizedId}
                      onClick={(e) => {
                        // prevent the menu button from causing a navigation
                        if (
                          parentHasClass(e.target as HTMLElement, 'prevent-nav')
                        ) {
                          return;
                        }

                        handleNavigation();
                      }}
                    >
                      <td
                        className={classNames(
                          'checkboxCell',
                          'prevent-nav'
                        )}
                      >
                        <input
                          type="checkbox"
                          className={'hiddenCheckbox'}
                          onChange={(e) => {
                            setSelectedIds((set) => {
                              const nextSet = new Set(set);

                              if (e.currentTarget.checked) {
                                nextSet.add(item._normalizedId);
                              } else {
                                nextSet.delete(item._normalizedId);
                              }

                              return nextSet;
                            });
                          }}
                          checked={selectedIds.has(item._normalizedId)}
                        />
                        <div
                          aria-hidden="true"
                          className={'checkboxFacade'}
                        >
                          <Checkbox
                            tabIndex={-1}
                            checked={selectedIds.has(item._normalizedId)}
                          />
                        </div>
                      </td>
                      <td className={'titleCell'}>
                        <TitleCell documentPreviewStore={documentPreviewStore} value={item} schemaType={schemaType} />
                      </td>
                      <td>
                        <Badge
                          fontSize={0}
                          tone={
                            item._status === 'published'
                              ? 'positive'
                              : item._status === 'unpublished'
                              ? 'caution'
                              : 'default'
                          }
                        >
                          {item._status}
                        </Badge>
                      </td>

                      {fields.map((field: SelectableField) => (
                        <Cell
                          field={field.field}
                          fieldPath={field.fieldPath}
                          value={get(item, field.fieldPath)}
                        />
                      ))}

                      <td className={'optionsCell'}>
                        <MenuButton
                          button={
                            <Button
                              className="prevent-nav"
                              icon={EllipsisVerticalIcon}
                              title="Options"
                              mode="bleed"
                            />
                          }
                          portal
                          id="prevent-nav-example"
                          menu={
                            <Menu className={'menu'}>
                              <MenuItem
                                className="prevent-nav"
                                text="Open"
                                icon={ArrowRightIcon}
                                onClick={handleNavigation}
                              />
                              {/* TODO */}
                              {/* <MenuItem
                                className="prevent-nav"
                                text="Discard changes"
                              />
                              <MenuItem
                                className="prevent-nav"
                                text="Unpublish"
                              />
                              <MenuDivider />
                              <MenuItem
                                className="prevent-nav"
                                tone="critical"
                                icon={TrashIcon}
                                text="Delete"
                              /> */}
                            </Menu>
                          }
                          placement="left"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Card
            borderTop
            style={{ position: `absolute`, bottom: 0, width: `100%` }}
            padding={3}
          >
            <Flex align="center" gap={2}>
              <Flex align="center" gap={2}>
                <Label style={{ whiteSpace: `nowrap` }}>Rows Per Page</Label>
                <Select
                  value={pageSize}
                  onChange={(e) =>
                    setPageSize(parseInt(e.currentTarget.value, 10))
                  }
                >
                  {rowsPerPage.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </Select>
              </Flex>

              <Box flex={1}>
                <Flex align="center" justify="flex-end" gap={2}>
                  <Button
                    fontSize={1}
                    disabled={client.page === 0}
                    onClick={() => client.setPage(client.page - 1)}
                    icon={ChevronLeftIcon}
                    title="Previous page"
                    mode="bleed"
                  />
                  <Label>
                    {client.totalPages === 0 ? 0 : client.page + 1}&nbsp;/&nbsp;
                    {client.totalPages}
                  </Label>
                  <Button
                    fontSize={1}
                    disabled={client.page >= client.totalPages - 1}
                    onClick={() => client.setPage(client.page + 1)}
                    icon={ChevronRightIcon}
                    title="Next Page"
                    mode="bleed"
                  />
                </Flex>
              </Box>
            </Flex>
          </Card>
        </div>

        <ColumnSelector
          open={columnSelectorOpen}
          // open={true}
          onClose={() => setColumnSelectorOpen(false)}
          typeName={typeName}
          initiallySelectedColumns={selectedColumns}
          onSelect={setSelectedColumns}
        />
      </>
    );
  }

  function SuperPaneWrapper() {
    return (
        <SuperPane />
    );
  }

  return Object.assign(S.documentTypeList(typeName).serialize(), {
    type: 'component',
    component: SuperPaneWrapper,
    menuItems: S.documentTypeList(typeName)
      .menuItems(
        [
          S.menuItem().title('Refresh').icon(SyncIcon).action(refresh.notify),
          S.menuItem().title('Search').icon(SearchIcon).action(search.notify),
          S.menuItem()
            .title('Select Columns')
            .icon(ControlsIcon)
            .action(selectColumns.notify),
        ].filter(Boolean)
      )
      .serialize().menuItems,
  });
}

export {createSuperPane};
