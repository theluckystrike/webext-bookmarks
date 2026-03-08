[![CI](https://github.com/theluckystrike/webext-bookmarks/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-bookmarks/actions)
[![npm](https://img.shields.io/npm/v/@theluckystrike/webext-bookmarks)](https://www.npmjs.com/package/@theluckystrike/webext-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![npm downloads](https://img.shields.io/npm/dm/@theluckystrike/webext-bookmarks)](https://www.npmjs.com/package/@theluckystrike/webext-bookmarks)

# @theluckystrike/webext-bookmarks

Typed bookmark helpers for Chrome extensions — create, search, organize, and sync bookmarks with full tree support. Part of [@zovo/webext](https://github.com/theluckystrike/webext).

## Features

- **Create Bookmarks** — Add new bookmarks and folders with type-safe parameters
- **Search** — Full-text search across titles, URLs, and folders
- **Move & Organize** — Reorder bookmarks and move them between folders
- **Update** — Modify titles and URLs with ease
- **Remove** — Delete bookmarks or entire subtrees
- **Get Tree** — Retrieve the complete bookmark hierarchy
- **Get Recent** — Access recently added or modified bookmarks
- **Events** — Subscribe to bookmark changes in real-time

## Installation

```bash
npm install @theluckystrike/webext-bookmarks
```

```bash
pnpm add @theluckystrike/webext-bookmarks
```

## Quick Start

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

// Get the entire bookmark tree
const tree = await bookmarks.getTree();

// Get children of a folder
const children = await bookmarks.getChildren('folder-id');

// Search bookmarks
const results = await bookmarks.search('example');

// Create a bookmark
const newBookmark = await bookmarks.create({
  title: 'My Bookmark',
  url: 'https://example.com',
  parentId: 'folder-id'
});

// Update a bookmark
const updated = await bookmarks.update('bookmark-id', {
  title: 'New Title'
});

// Remove a bookmark
await bookmarks.remove('bookmark-id');

// Remove a bookmark and all its children
await bookmarks.removeTree('folder-id');

// Move a bookmark
await bookmarks.move('bookmark-id', {
  parentId: 'new-folder-id',
  index: 0
});

// Listen to bookmark events
const unsubCreated = bookmarks.onCreated((id, bookmark) => {
  console.log('Created:', bookmark.title);
});

const unsubRemoved = bookmarks.onRemoved((id, removeInfo) => {
  console.log('Removed from:', removeInfo.parentId);
});

const unsubChanged = bookmarks.onChanged((id, changeInfo) => {
  console.log('Changed:', changeInfo.title);
});

const unsubMoved = bookmarks.onMoved((id, moveInfo) => {
  console.log('Moved to:', moveInfo.parentId);
});

// Unsubscribe from events
unsubCreated();
unsubRemoved();
unsubChanged();
unsubMoved();
```

## Advanced Usage

### Building a Tree UI

```typescript
interface TreeNode {
  id: string;
  title: string;
  url?: string;
  children: TreeNode[];
  parentId?: string;
}

function flattenTree(nodes: chrome.bookmarks.BookmarkTreeNode[]): TreeNode[] {
  return nodes.map(node => ({
    id: node.id,
    title: node.title,
    url: node.url,
    children: node.children ? flattenTree(node.children) : [],
    parentId: node.parentId
  }));
}

const tree = await bookmarks.getTree();
const flat = flattenTree(tree);
```

### Bookmark Deduplication

```typescript
async function deduplicateBookmarks(): Promise<number> {
  const tree = await bookmarks.getTree();
  const urlMap = new Map<string, string>();
  let removed = 0;

  function traverse(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    for (const node of nodes) {
      if (node.url) {
        if (urlMap.has(node.url)) {
          await bookmarks.remove(node.id);
          removed++;
        } else {
          urlMap.set(node.url, node.id);
        }
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return removed;
}
```

### Import/Export Bookmarks

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

interface ExportData {
  version: 1;
  exportedAt: string;
  bookmarks: chrome.bookmarks.BookmarkTreeNode[];
}

async function exportBookmarks(): Promise<ExportData> {
  const tree = await bookmarks.getTree();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    bookmarks: tree
  };
}

async function importBookmarks(data: ExportData, parentId: string = '0') {
  for (const node of data.bookmarks) {
    if (node.children) {
      const folder = await bookmarks.create({
        parentId,
        title: node.title
      });
      await importBookmarks({ ...data, bookmarks: node.children }, folder.id);
    } else if (node.url) {
      await bookmarks.create({
        parentId,
        title: node.title,
        url: node.url
      });
    }
  }
}
```

## API Reference

### Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getTree()` | Get the entire bookmark tree | `Promise<BookmarkTreeNode[]>` |
| `getChildren(id)` | Get children of a specific folder | `Promise<BookmarkTreeNode[]>` |
| `search(query)` | Search bookmarks by query string or object | `Promise<BookmarkTreeNode[]>` |
| `create(bookmark)` | Create a new bookmark or folder | `Promise<BookmarkTreeNode>` |
| `update(id, changes)` | Update an existing bookmark | `Promise<BookmarkTreeNode>` |
| `remove(id)` | Remove a bookmark (non-recursive) | `Promise<void>` |
| `removeTree(id)` | Remove a bookmark and all its children | `Promise<void>` |
| `move(id, dest)` | Move a bookmark to a new location | `Promise<BookmarkTreeNode>` |

### Event Listeners

| Function | Description | Callback Args |
|----------|-------------|---------------|
| `onCreated(cb)` | Listen for bookmark creation | `(id: string, bookmark: BookmarkTreeNode)` |
| `onRemoved(cb)` | Listen for bookmark removal | `(id: string, removeInfo: { parentId, index })` |
| `onChanged(cb)` | Listen for bookmark changes | `(id: string, changeInfo: { title, url? })` |
| `onMoved(cb)` | Listen for bookmark moves | `(id: string, moveInfo: { parentId, index, oldParentId, oldIndex })` |

All event listeners return an unsubscribe function.

## Permissions

This library requires the `bookmarks` permission in your `manifest.json`:

```json
{
  "permissions": [
    "bookmarks"
  ]
}
```

For MV3 (Manifest V3), no additional host permissions are needed for bookmark operations.

## Related

- [@theluckystrike/webext-tabs](https://github.com/theluckystrike/webext-tabs) — Typed tab helpers
- [@theluckystrike/webext-context-menu](https://github.com/theluckystrike/webext-context-menu) — Context menu helpers
- [@theluckystrike/webext-storage](https://github.com/theluckystrike/chrome-storage-typed) — Typed storage helpers

## License

MIT

---

Built by [theluckystrike](https://github.com/theluckystrike) — [zovo.one](https://zovo.one)
