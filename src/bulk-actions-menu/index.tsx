import React, { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import {
  Menu,
  MenuItem,
  MenuDivider,
  Dialog,
  Button,
  MenuButton,
  Label,
  useToast,
} from '@sanity/ui';
import {
  ResetIcon,
  UnpublishIcon,
  PublishIcon,
  TrashIcon,
} from '@sanity/icons';
import schema from 'part:@sanity/base/schema';
import SanityPreview from 'part:@sanity/base/preview';
import styles from './styles.module.css';
import _client from 'part:@sanity/base/client';
import { ErrorBoundary } from 'react-error-boundary';
const client = _client as import('@sanity/client').SanityClient;

interface Props {
  className?: string;
  typeName: string;
  selectedIds: Set<string>;
}

const ErroredDocuments = ({ e, schemaType }: { e: any; schemaType: any }) => {
  const idsWithErrors: string[] =
    'details' in e ? e.details.items.map((item: any) => item.error.id) : [];

  if (!idsWithErrors.length) {
    return null;
  }

  const plural = idsWithErrors.length !== 1;

  return (
    <ErrorBoundary fallback={null}>
      <p>
        Please unselect {plural ? 'these' : 'this'} document{plural ? 's' : ''}{' '}
        and try again:
      </p>
      <p>
        {idsWithErrors.map((id) => (
          <SanityPreview
            type={schemaType}
            key={id}
            value={{ _id: id, _type: 'movie' }}
          />
        ))}
      </p>
    </ErrorBoundary>
  );
};

const removeDraftPrefix = (s: string) =>
  s.startsWith('drafts.') ? s.substring('drafts.'.length) : s;

function BulkActionsMenu({ className, selectedIds, typeName }: Props) {
  const buttonId = useMemo(nanoid, []);
  const schemaType = useMemo(() => schema.get(typeName), [typeName]);
  const toast = useToast();
  const dialogId = useMemo(nanoid, []);
  const [dialogMode, setDialogMode] = useState<
    'discard_changes' | 'unpublish' | 'publish' | 'delete' | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleDiscardChanges = async () => {
    setLoading(true);

    try {
      const ids = await client.fetch<string[]>('*[_id in $ids]._id', {
        ids: Array.from(selectedIds)
          .map((id) => [id, `drafts.${id}`])
          .flat(),
      });

      const idSet = ids.reduce((set, id) => {
        set.add(id);
        return set;
      }, new Set<string>());

      const draftIdsThatAlsoHavePublishedIds = ids.filter(
        (id) =>
          id.startsWith('drafts.') && idSet.has(id.substring('drafts.'.length)),
      );

      const t = client.transaction();

      for (const id of draftIdsThatAlsoHavePublishedIds) {
        t.delete(id);
      }

      await t.commit();
      setDialogMode(null);
    } catch (e) {
      console.warn(e);

      toast.push({
        title: 'Error Bulk Discarding Changes',
        description: (
          <>
            <p>The bulk discard changes failed.</p>

            <ErroredDocuments e={e} schemaType={schemaType} />
          </>
        ),
        status: 'error',
        closable: true,
        duration: 30 * 1000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);

    try {
      const publishedDocuments = await client.fetch<any[]>('*[_id in $ids]', {
        ids: Array.from(selectedIds),
      });

      const t = client.transaction();

      for (const publishedDocument of publishedDocuments) {
        t.createIfNotExists({
          ...publishedDocument,
          _id: `drafts.${publishedDocument._id}`,
          _updatedAt: new Date().toISOString(),
        });
        t.delete(publishedDocument._id);
      }

      await t.commit();
    } catch (e) {
      console.warn(e);

      toast.push({
        title: 'Error Bulk Unpublishing',
        description: (
          <>
            <p>
              The bulk unpublished failed. This usually occurs because there are
              other documents referencing the documents you’re trying to
              unpublish.
            </p>

            <ErroredDocuments e={e} schemaType={schemaType} />
          </>
        ),
        status: 'error',
        closable: true,
        duration: 30 * 1000,
      });
    } finally {
      setDialogMode(null);
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);

    try {
      const draftDocuments = await client.fetch<any[]>('*[_id in $ids]', {
        ids: Array.from(selectedIds).map((id) => `drafts.${id}`),
      });

      const t = client.transaction();

      for (const draftDocument of draftDocuments) {
        t.createOrReplace({
          ...draftDocument,
          _id: removeDraftPrefix(draftDocument._id),
          _updatedAt: new Date().toISOString(),
        });
        t.delete(draftDocument._id);
      }

      await t.commit();
    } catch (e) {
      console.warn(e);

      toast.push({
        title: 'Error Bulk Publishing',
        description: (
          <>
            <p>The bulk publish failed.</p>

            <ErroredDocuments e={e} schemaType={schemaType} />
          </>
        ),
        status: 'error',
        closable: true,
        duration: 30 * 1000,
      });
    } finally {
      setDialogMode(null);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const idsToDelete = await client.fetch<string[]>('*[_id in $ids]._id', {
        ids: Array.from(selectedIds)
          .map((id) => [id, `drafts.${id}`])
          .flat(),
      });

      const t = client.transaction();

      for (const id of idsToDelete) {
        t.delete(id);
      }

      await t.commit();
    } catch (e) {
      console.warn(e);

      toast.push({
        title: 'Error Bulk Deleting',
        description: (
          <>
            <p>
              The bulk delete failed. This usually occurs because there are
              other documents referencing the documents you’re trying to
              delete.
            </p>

            <ErroredDocuments e={e} schemaType={schemaType} />
          </>
        ),
        status: 'error',
        closable: true,
        duration: 30 * 1000,
      });
    } finally {
      setDialogMode(null);
      setLoading(false);
    }
  };

  return (
    <>
      <MenuButton
        button={
          <button className={className}>
            <Label>Bulk Actions</Label>
          </button>
        }
        portal
        id={buttonId}
        menu={
          <Menu style={{ textAlign: 'left' }}>
            {/* TODO: */}
            {/* <MenuItem className="prevent-nav" text="Bulk Edit" icon={EditIcon} /> */}
            {/* <MenuDivider /> */}
            {/* <MenuItem className="prevent-nav" text="Export" icon={DownloadIcon} /> */}
            <MenuItem
              className="prevent-nav"
              text="Discard changes"
              icon={ResetIcon}
              onClick={() => setDialogMode('discard_changes')}
            />
            <MenuItem
              className="prevent-nav"
              text="Unpublish"
              icon={UnpublishIcon}
              onClick={() => setDialogMode('unpublish')}
            />
            <MenuItem
              className="prevent-nav"
              text="Publish"
              icon={PublishIcon}
              onClick={() => setDialogMode('publish')}
            />
            <MenuDivider />
            <MenuItem
              className="prevent-nav"
              tone="critical"
              icon={TrashIcon}
              text="Delete"
              onClick={() => setDialogMode('delete')}
            />
          </Menu>
        }
        placement="bottom"
      />

      {dialogMode === 'discard_changes' && (
        <Dialog
          id={dialogId}
          header={<>Discard Changes</>}
          zOffset={100000}
          footer={
            <div className={styles.footer}>
              <Button
                text="Cancel"
                mode="ghost"
                disabled={loading}
                onClick={() => setDialogMode(null)}
              />
              <Button
                text="Discard Changes"
                tone="critical"
                mode="ghost"
                disabled={loading}
                onClick={handleDiscardChanges}
              />
            </div>
          }
          onClose={() => setDialogMode(null)}
        >
          <div className={styles.content}>
            <p>
              Are you sure you want to discard changes to{' '}
              <strong>{selectedIds.size}</strong> document
              {selectedIds.size === 1 ? '' : 's'}?
            </p>
            <p>
              Discarding changes reverts changes made to any drafts of the
              selected documents and restores the currently published versions.
            </p>
            <p>
              You can use the{' '}
              <a
                href="https://www.sanity.io/docs/history-experience"
                target="_blank"
                rel="noreferrer noopener"
              >
                document history
              </a>{' '}
              of each individual document to track these changes.
            </p>
          </div>
        </Dialog>
      )}

      {dialogMode === 'unpublish' && (
        <Dialog
          id={dialogId}
          header={<>Unpublish Documents</>}
          zOffset={100000}
          footer={
            <div className={styles.footer}>
              <Button
                text="Cancel"
                mode="ghost"
                disabled={loading}
                onClick={() => setDialogMode(null)}
              />
              <Button
                text="Unpublish Documents"
                tone="critical"
                mode="ghost"
                disabled={loading}
                onClick={handleUnpublish}
              />
            </div>
          }
          onClose={() => setDialogMode(null)}
        >
          <div className={styles.content}>
            <p>
              Are you sure you want to unpublish{' '}
              <strong>{selectedIds.size}</strong> document
              {selectedIds.size === 1 ? '' : 's'}?
            </p>
            <p>
              If you unpublish a document, it will no longer be available to the
              public. Its contents will be moved into a draft if a draft does
              not already exist. From there you can continue to author the
              document and re-publish it later.
            </p>
            <p>
              You can use the{' '}
              <a
                href="https://www.sanity.io/docs/history-experience"
                target="_blank"
                rel="noreferrer noopener"
              >
                document history
              </a>{' '}
              of each individual document to track these changes.
            </p>
          </div>
        </Dialog>
      )}

      {dialogMode === 'publish' && (
        <Dialog
          id={dialogId}
          header={<>Publish Documents</>}
          zOffset={100000}
          footer={
            <div className={styles.footer}>
              <Button
                text="Cancel"
                mode="ghost"
                disabled={loading}
                onClick={() => setDialogMode(null)}
              />
              <Button
                text="Publish Documents"
                tone="positive"
                disabled={loading}
                onClick={handlePublish}
              />
            </div>
          }
          onClose={() => setDialogMode(null)}
        >
          <div className={styles.content}>
            <p>
              Are you sure you want to publish{' '}
              <strong>{selectedIds.size}</strong> document
              {selectedIds.size === 1 ? '' : 's'}?
            </p>
            <p>
              Publishing a document makes the current contents of each document
              publicly available.
            </p>
            <p>
              You can use the{' '}
              <a
                href="https://www.sanity.io/docs/history-experience"
                target="_blank"
                rel="noreferrer noopener"
              >
                document history
              </a>{' '}
              of each individual document to track these changes.
            </p>
          </div>
        </Dialog>
      )}

      {dialogMode === 'delete' && (
        <Dialog
          id={dialogId}
          header={<>Delete Documents</>}
          zOffset={100000}
          footer={
            <div className={styles.footer}>
              <Button
                text="Cancel"
                mode="ghost"
                disabled={loading}
                onClick={() => setDialogMode(null)}
              />
              <Button
                text="Delete Documents"
                tone="critical"
                disabled={loading}
                onClick={handleDelete}
              />
            </div>
          }
          onClose={() => setDialogMode(null)}
        >
          <div className={styles.content}>
            <p>
              Are you sure you want to delete{' '}
              <strong>{selectedIds.size}</strong> document
              {selectedIds.size === 1 ? '' : 's'}?
            </p>
            <p>
              Deleting a document makes it no longer available to the public as
              well as removing any draft versions of it.
            </p>
            <p>
              <strong>Note:</strong> in order to delete a document, it must not
              be referenced by any other document. You may have to remove those
              references first.
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
}

export default BulkActionsMenu;
