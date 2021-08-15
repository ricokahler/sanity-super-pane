import React, { useEffect, useState, useRef } from 'react';
import useRouter, { RouterProvider } from './use-router';
import classNames from 'classnames';
import schema from 'part:@sanity/base/schema';
import SanityPreview from 'part:@sanity/base/preview';
import BulkActionsMenu from './bulk-actions-menu';
import createEmitter from './create-emitter';
import usePaginatedClient from './use-paginated-client';
import ColumnSelector from './column-selector';
import Cell from './cell';
import {
  Label,
  Button,
  Select,
  MenuButton,
  Menu,
  MenuItem,
  Checkbox,
  Badge,
} from '@sanity/ui';
import {
  EllipsisVerticalIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SyncIcon,
  SpinnerIcon,
  ControlsIcon,
} from '@sanity/icons';
import styles from './styles.module.css';
import SearchField from './search-field';
import FieldToSearchFor from './search-field/FieldToSearchFor';

function parentHasClass(el: HTMLElement | null, className: string): boolean {
  if (!el) return false;
  if (el.classList.contains(className)) return true;
  return parentHasClass(el.parentElement, className);
}

function createSuperPane(typeName: string, S: any) {
  const schemaType = schema.get(typeName);
  const selectColumns = createEmitter();
  const refresh = createEmitter();

  const fieldsToChooseFrom = schemaType.fields.map((field: any) => ({ name: field.name, title: field.type.title }))

  function SuperPane() {
    const router = useRouter();
    const [pageSize, setPageSize] = useState(25);
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(new Set<string>());
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const [selectedFieldToSearchFor, setSelectedFieldToSearchFor] = useState<FieldToSearchFor>(fieldsToChooseFrom[0])
    const containerRef = useRef<HTMLDivElement>(null);

    const client = usePaginatedClient({
      typeName,
      pageSize,
      selectedColumns,
      selectedFieldToSearchFor
    });

    useEffect(() => {
      return selectColumns.subscribe(() => setColumnSelectorOpen(true));
    }, []);

    useEffect(() => {
      return refresh.subscribe(client.refresh);
    }, [client.refresh]);

    const fields = schemaType.fields.filter((field: any) =>
      selectedColumns.has(field.name)
    );

    const atLeastOneSelected = client.results.some((i) =>
      selectedIds.has(i._normalizedId)
    );
    const allSelected = client.results.every((i) =>
      selectedIds.has(i._normalizedId)
    );

    return (
      <>
        <div ref={containerRef} className={styles.container}>
          <div
            className={classNames(styles.bulkInfo, {
              [styles.bulkInfoRevealed]: selectedIds.size > 0,
            })}
          >
            <div className={styles.bulkInfoContainer}>
              <Label>
                {selectedIds.size} item{selectedIds.size === 1 ? '' : 's'}{' '}
                selected
              </Label>
              <button
                className={styles.clearButton}
                onClick={() => setSelectedIds(new Set())}
              >
                <Label>Clear</Label>
              </button>

              <BulkActionsMenu
                className={styles.clearButton}
                selectedIds={selectedIds}
                typeName={typeName}
                onDelete={() => {
                  setSelectedIds(new Set());
                  client.setPage(0);
                  client.refresh();
                }}
              />
            </div>
          </div>
          <div>
            <SearchField
              searchCallback={client.setUserQuery}
              currentField={selectedFieldToSearchFor}
              fieldsToChooseFrom={fieldsToChooseFrom}
              onFieldSelected={setSelectedFieldToSearchFor}
            />
          </div>
          <div className={styles.tableWrapper}>
            <div
              className={classNames(styles.loadingOverlay, {
                [styles.loadingOverlayActive]: client.loading,
              })}
            >
              <SpinnerIcon className={styles.loadingSpinner} />
            </div>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th
                    className={classNames(styles.checkboxCell, 'prevent-nav')}
                  >
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
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
                    <div aria-hidden="true" className={styles.checkboxFacade}>
                      <Checkbox
                        tabIndex={-1}
                        checked={atLeastOneSelected}
                        indeterminate={atLeastOneSelected && !allSelected}
                      />
                    </div>
                  </th>
                  <th>
                    <Label>{schemaType.title}</Label>
                  </th>
                  <th>
                    <Label>Status</Label>
                  </th>
                  {selectedColumns.has('_updatedAt') && (
                    <th>
                      <Label>Updated At</Label>
                    </th>
                  )}
                  {fields.map((field: any) => (
                    <th key={field.name}>
                      <Label>{field.type.title}</Label>
                    </th>
                  ))}
                  <th className={styles.optionsCell} aria-label="Options" />
                </tr>
              </thead>

              <tbody className={styles.tbody}>
                {client.results.map((item) => {
                  const handleNavigation = () => {
                    router.navigateUrl(
                      router.resolveIntentLink('edit', {
                        id: item._id,
                        type: item._type,
                      })
                    );
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
                          styles.checkboxCell,
                          'prevent-nav'
                        )}
                      >
                        <input
                          type="checkbox"
                          className={styles.hiddenCheckbox}
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
                          className={styles.checkboxFacade}
                        >
                          <Checkbox
                            tabIndex={-1}
                            checked={selectedIds.has(item._normalizedId)}
                          />
                        </div>
                      </td>
                      <td className={styles.titleCell}>
                        <SanityPreview
                          type={schemaType}
                          layout="default"
                          value={item}
                        />
                      </td>
                      <td>
                        <Badge
                          size={1}
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

                      {selectedColumns.has('_updatedAt') && (
                        <td>{new Date(item._updatedAt).toLocaleString()}</td>
                      )}

                      {fields.map((field: any) => (
                        <Cell field={field} value={item[field.name]} />
                      ))}

                      <td className={styles.optionsCell}>
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
                            <Menu className={styles.menu}>
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

          <div className={styles.footer}>
            <label className={styles.selectLabel}>
              <Label>Rows Per Page</Label>
              <div className={styles.select}>
                <Select
                  value={pageSize}
                  onChange={(e) =>
                    setPageSize(parseInt(e.currentTarget.value, 10))
                  }
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                </Select>
              </div>
            </label>
            <Button
              fontSize={1}
              disabled={client.page === 0}
              onClick={() => client.setPage(client.page - 1)}
              icon={ChevronLeftIcon}
              title="Previous page"
              mode="bleed"
            />
            <Label>
              {client.totalPages === 0 ? 0 : client.page + 1}&nbsp;/&nbsp;{client.totalPages}
            </Label>
            <Button
              fontSize={1}
              disabled={client.page >= client.totalPages - 1}
              onClick={() => client.setPage(client.page + 1)}
              icon={ChevronRightIcon}
              title="Next Page"
              mode="bleed"
            />
          </div>
        </div>

        <ColumnSelector
          open={columnSelectorOpen}
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
      <RouterProvider>
        <SuperPane />
      </RouterProvider>
    );
  }

  return Object.assign(S.documentTypeList(typeName).serialize(), {
    type: 'component',
    component: SuperPaneWrapper,
    menuItems: S.documentTypeList(typeName)
      .menuItems([
        S.menuItem().title('Refresh').icon(SyncIcon).action(refresh.notify),
        S.menuItem()
          .title('Select Columns')
          .icon(ControlsIcon)
          .action(selectColumns.notify),
      ])
      .serialize().menuItems,
  });
}

export default createSuperPane;
