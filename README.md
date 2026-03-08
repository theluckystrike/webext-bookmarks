[![CI](https://github.com/theluckystrike/webext-bookmarks/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-bookmarks/actions)
[![npm](https://img.shields.io/npm/v/@theluckystrike/webext-bookmarks)](https://www.npmjs.com/package/@theluckystrike/webext-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

# @theluckystrike/webext-bookmarks

Typed bookmark helpers for Chrome extensions — create, search, organize, and sync bookmarks with full tree support. Part of [@zovo/webext](https://github.com/theluckystrike/webext).

## Features

- **Create** bookmarks and folders with full type safety
- **Search** bookmarks by title, URL, or custom queries
- **Move** bookmarks between folders with ease
- **Update** bookmark titles and URLs
- **Remove** individual bookmarks or entire subtrees
- **Get Tree** retrieve the complete bookmark hierarchy
- **Get Recent** fetch recently added bookmarks
- **Events** subscribe to bookmark changes in real-time

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

// Create a folder
const newFolder = await bookmarks.create({
  title: 'My Folder',
  parentId: 'parent-folder-id'
});

// Get recent bookmarks (last 10)
const recent = await bookmarks.getRecent(10);

// Update a bookmark
const updated = await bookmarks.update('bookmark-id', {
  title: 'New Title'
});

// Move a bookmark
await bookmarks.move('bookmark-id', {
  parentId: 'new-folder-id',
  index: 0
});

// Remove a bookmark
await bookmarks.remove('bookmark-id');

// Remove a bookmark and all its children
await bookmarks.removeTree('folder-id');
```

## Event Listeners

Subscribe to bookmark changes in real-time:

```typescript
// Listen for bookmark creation
const unsubCreated = bookmarks.onCreated((id, bookmark) => {
  console.log('Created:', bookmark.title);
});

// Listen for bookmark removal
const unsubRemoved = bookmarks.onRemoved((id, removeInfo) => {
  console.log('Removed from:', removeInfo.parentId);
});

// Listen for bookmark changes
const unsubChanged = bookmarks.onChanged((id, changeInfo) => {
  console.log('Changed:', changeInfo.title);
});

// Listen for bookmark moves
const unsubMoved = bookmarks.onMoved((id, moveInfo) => {
  console.log('Moved to:', moveInfo.parentId);
});

// Unsubscribe when done
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
    parentId: node.parentId,
    children: node.children ? flattenTree(node.children) : []
  }));
}

const tree = await bookmarks.getTree();
const flat = flattenTree(tree);
```

### Bookmark Deduplication

```typescript
async function deduplicateBookmarks(parentId: string) {
  const children = await bookmarks.getChildren(parentId);
  const urlMap = new Map<string, chrome.bookmarks.BookmarkTreeNode>();

  for (const bookmark of children) {
    if (!bookmark.url) continue;

    if (urlMap.has(bookmark.url)) {
      // Remove duplicate
      await bookmarks.remove(bookmark.id);
      console.log(`Removed duplicate: ${bookmark.title}`);
    } else {
      urlMap.set(bookmark.url, bookmark);
    }
  }
}
```

### Import/Export Bookmarks

```typescript
// Export bookmarks to JSON
async function exportBookmarks(): Promise<string> {
  const tree = await bookmarks.getTree();
  return JSON.stringify(tree, null, 2);
}

// Import bookmarks from JSON
async function importBookmarks(json: string, parentId: string = '0') {
  const bookmarks = JSON.parse(json);

  async function importRecursive(nodes: any[], parentId: string) {
    for (const node of nodes) {
      if (node.url) {
        await bookmarks.create({
          title: node.title,
          url: node.url,
          parentId
        });
      } else if (node.children) {
        const folder = await bookmarks.create({
          title: node.title,
          parentId
        });
        await importRecursive(node.children, folder.id);
      }
    }
  }

  await importRecursive(bookmarks, parentId);
}
```

## API Reference

### Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getTree()` | Get the entire bookmark tree | `Promise<BookmarkTreeNode[]>` |
| `getChildren(id)` | Get children of a specific folder | `Promise<BookmarkTreeNode[]>` |
| `getRecent(number)` | Get most recently added bookmarks | `Promise<BookmarkTreeNode[]>` |
| `search(query)` | Search bookmarks by query string or object | `Promise<BookmarkTreeNode[]>` |
| `create(bookmark)` | Create a new bookmark or folder | `Promise<BookmarkTreeNode>` |
| `update(id, changes)` | Update an existing bookmark | `Promise<BookmarkTreeNode>` |
| `remove(id)` | Remove a bookmark (non-recursive) | `Promise<void>` |
| `removeTree(id)` | Remove a bookmark and all its children | `Promise<void>` |
| `move(id, dest)` | Move a bookmark to a new location | `Promise<BookmarkTreeNode>` |

### Event Listeners

| Event | Description | Callback Parameters |
|-------|-------------|---------------------|
| `onCreated(cb)` | Listen for bookmark creation | `(id: string, bookmark: BookmarkTreeNode)` |
| `onRemoved(cb)` | Listen for bookmark removal | `(id: string, removeInfo: { parentId, index })` |
| `onChanged(cb)` | Listen for bookmark changes | `(id: string, changeInfo: { title, url? })` |
| `onMoved(cb)` | Listen for bookmark moves | `(id: string, moveInfo: { parentId, index, oldParentId, oldIndex })` |

All event listeners return an unsubscribe function.

## Permissions

Add the `bookmarks` permission to your `manifest.json`:

```json
{
  "permissions": [
    "bookmarks"
  ]
}
```

## Related

- [@theluckystrike/webext](https://github.com/theluckystrike/webext) - Core webext utilities
- [@theluckystrike/webext-storage](https://github.com/theluckystrike/webext-storage) - Typed storage helpers
- [@theluckystrike/webext-tabs](https://github.com/theluckystrike/webext-tabs) - Tab management utilities

## License

MIT

---

Built by [theluckystrike](https://github.com/theluckystrike) — [zovo.one](https://zovo.one)
