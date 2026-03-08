# @theluckystrike/webext-bookmarks

[![CI](https://github.com/theluckystrike/webext-bookmarks/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-bookmarks/actions)
[![npm](https://img.shields.io/npm/v/@theluckystrike/webext-bookmarks)](https://www.npmjs.com/package/@theluckystrike/webext-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Typed bookmark helpers for Chrome extensions. Part of [@zovo/webext](https://github.com/theluckystrike/webext).

## Features

- **Create bookmarks** — Add new bookmarks with title, URL, and parent folder
- **Create folders** — Organize bookmarks into hierarchical folders
- **Search** — Find bookmarks by title, URL, or custom query objects
- **Move** — Reorganize bookmarks between folders with precise index control
- **Update** — Modify bookmark titles and URLs
- **Remove** — Delete bookmarks or entire bookmark trees
- **Get tree** — Retrieve the complete bookmark hierarchy
- **Get recent** — Access recently added or modified bookmarks
- **Event listeners** — Subscribe to real-time bookmark changes:
  - `onCreated` — Fires when a bookmark or folder is created
  - `onRemoved` — Fires when a bookmark or folder is removed
  - `onChanged` — Fires when a bookmark's title or URL changes
  - `onMoved` — Fires when a bookmark is moved to a different folder

## Installation

```bash
npm install @theluckystrike/webext-bookmarks
```

```bash
pnpm add @theluckystrike/webext-bookmarks
```

## Quick Start

### Create a Bookmark

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

// Create a simple bookmark
const bookmark = await bookmarks.create({
  title: 'Google',
  url: 'https://google.com',
  parentId: 'folder-id' // optional, defaults to bookmarks bar
});

console.log('Created:', bookmark.id);
```

### Create a Folder

```typescript
// Create a new folder
const folder = await bookmarks.create({
  title: 'Work Resources',
  parentId: 'root-id' // or omit for the bookmarks bar
});

// Add bookmarks to the folder
await bookmarks.create({
  title: 'Jira',
  url: 'https://jira.example.com',
  parentId: folder.id
});
```

### Search Bookmarks

```typescript
// Simple text search
const results = await bookmarks.search('documentation');

// Advanced search with filters
const docs = await bookmarks.search({
  query: 'guide',
  url: 'https://*.example.com/*'
});

console.log(`Found ${docs.length} matching bookmarks`);
```

## Advanced Patterns

### Build a Bookmark Tree UI

Recursively traverse the bookmark tree to build a navigation component:

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

interface TreeNode {
  id: string;
  title: string;
  url?: string;
  children?: TreeNode[];
}

async function buildBookmarkTree(): Promise<TreeNode[]> {
  const tree = await bookmarks.getTree();
  
  function mapNode(node: chrome.bookmarks.BookmarkTreeNode): TreeNode {
    const result: TreeNode = {
      id: node.id,
      title: node.title,
    };
    
    if (node.url) {
      result.url = node.url;
    }
    
    if (node.children && node.children.length > 0) {
      result.children = node.children.map(mapNode);
    }
    
    return result;
  }
  
  return tree.map(mapNode);
}

// Render as nested list
function renderTree(nodes: TreeNode[], depth = 0): string {
  return nodes.map(node => {
    const indent = '  '.repeat(depth);
    let line = `${indent}- ${node.title}`;
    
    if (node.url) {
      line += ` (${node.url})`;
    }
    
    let output = line + '\n';
    
    if (node.children) {
      output += renderTree(node.children, depth + 1);
    }
    
    return output;
  }).join('');
}

// Usage
const tree = await buildBookmarkTree();
console.log(renderTree(tree));
```

### Sync Bookmarks Across Devices

Use event listeners to sync bookmarks with a remote server:

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

const API_URL = 'https://api.example.com/sync';

async function syncToServer(bookmark: chrome.bookmarks.BookmarkTreeNode) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      bookmark: {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        parentId: bookmark.parentId,
      }
    })
  });
}

// Listen for new bookmarks
const unsubCreated = bookmarks.onCreated(async (id, bookmark) => {
  console.log('Bookmark created:', bookmark.title);
  await syncToServer(bookmark);
});

// Listen for removed bookmarks
const unsubRemoved = bookmarks.onRemoved(async (id, removeInfo) => {
  console.log('Bookmark removed:', id);
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'remove',
      bookmarkId: id,
      parentId: removeInfo.parentId
    })
  });
});

// Listen for changes
const unsubChanged = bookmarks.onChanged(async (id, changeInfo) => {
  console.log('Bookmark changed:', id, changeInfo);
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update',
      bookmarkId: id,
      changes: changeInfo
    })
  });
});

// Clean up on unload
window.addEventListener('unload', () => {
  unsubCreated();
  unsubRemoved();
  unsubChanged();
});
```

### Bookmark Deduplication

Find and merge duplicate bookmarks:

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

async function findDuplicates(): Promise<Map<string, chrome.bookmarks.BookmarkTreeNode[]>> {
  const tree = await bookmarks.getTree();
  const urlMap = new Map<string, chrome.bookmarks.BookmarkTreeNode[]>();
  
  function collectBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    for (const node of nodes) {
      if (node.url) {
        const existing = urlMap.get(node.url) || [];
        existing.push(node);
        urlMap.set(node.url, existing);
      }
      if (node.children) {
        collectBookmarks(node.children);
      }
    }
  }
  
  collectBookmarks(tree);
  
  // Filter to only URLs with duplicates
  const duplicates = new Map<string, chrome.bookmarks.BookmarkTreeNode[]>();
  for (const [url, nodes] of urlMap) {
    if (nodes.length > 1) {
      duplicates.set(url, nodes);
    }
  }
  
  return duplicates;
}

async function removeDuplicates(keepNewest = true): Promise<number> {
  const duplicates = await findDuplicates();
  let removed = 0;
  
  for (const [, nodes] of duplicates) {
    // Sort by date if possible (bookmarks don't have dates, so use position)
    const sorted = keepNewest ? nodes.reverse() : nodes;
    const [first, ...rest] = sorted;
    
    for (const node of rest) {
      await bookmarks.remove(node.id);
      removed++;
    }
  }
  
  return removed;
}

// Usage: Find and display duplicates
const duplicates = await findDuplicates();
console.log(`Found ${duplicates.size} duplicate URLs`);

for (const [url, nodes] of duplicates) {
  console.log(`\n${url} appears ${nodes.length} times:`);
  for (const node of nodes) {
    console.log(`  - ${node.title} (${node.parentId})`);
  }
}
```

### Import/Export Bookmarks

Export bookmarks to JSON and import from JSON:

```typescript
import * as bookmarks from '@theluckystrike/webext-bookmarks';

interface ExportNode {
  title: string;
  url?: string;
  children?: ExportNode[];
}

async function exportBookmarks(): Promise<string> {
  const tree = await bookmarks.getTree();
  
  function transform(node: chrome.bookmarks.BookmarkTreeNode): ExportNode {
    const result: ExportNode = {
      title: node.title,
    };
    
    if (node.url) {
      result.url = node.url;
    }
    
    if (node.children && node.children.length > 0) {
      result.children = node.children.map(transform);
    }
    
    return result;
  }
  
  return JSON.stringify(tree.map(transform), null, 2);
}

async function importBookmarks(
  json: string,
  parentId: string = 'root'
): Promise<number> {
  const data: ExportNode[] = JSON.parse(json);
  let imported = 0;
  
  async function importNode(node: ExportNode, targetParentId: string) {
    const result = await bookmarks.create({
      title: node.title,
      url: node.url,
      parentId: targetParentId,
    });
    
    imported++;
    
    if (node.children) {
      for (const child of node.children) {
        await importNode(child, result.id);
      }
    }
  }
  
  for (const node of data) {
    await importNode(node, parentId);
  }
  
  return imported;
}

// Usage
const exported = await exportBookmarks();
console.log('Exported bookmarks:', exported.length, 'characters');

// Save to file or sync service
await downloadAsFile('bookmarks.json', exported);

// Import later
const imported = await importBookmarks(jsonContent);
console.log(`Imported ${imported} bookmarks`);
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

| Function | Description | Callback Parameters |
|----------|-------------|---------------------|
| `onCreated(cb)` | Listen for bookmark creation | `(id: string, bookmark: BookmarkTreeNode) => void` |
| `onRemoved(cb)` | Listen for bookmark removal | `(id: string, removeInfo: { parentId, index }) => void` |
| `onChanged(cb)` | Listen for bookmark changes | `(id: string, changeInfo: { title, url? }) => void` |
| `onMoved(cb)` | Listen for bookmark moves | `(id: string, moveInfo: { parentId, index, oldParentId, oldIndex }) => void` |

All event listeners return an unsubscribe function.

### Types

```typescript
interface BookmarkCreateArg {
  parentId?: string;
  title: string;
  url?: string;
  index?: number;
}

interface BookmarkUpdateArg {
  title?: string;
  url?: string;
}

interface BookmarkMoveArg {
  parentId?: string;
  index?: number;
}
```

## Permissions

Add the `bookmarks` permission to your `manifest.json`:

```json
{
  "name": "My Extension",
  "version": "1.0.0",
  "manifest_version": 3,
  "permissions": [
    "bookmarks"
  ]
}
```

## Part of @zovo/webext

`@theluckystrike/webext-bookmarks` is part of the [@zovo/webext](https://github.com/theluckystrike/webext) collection of typed Chrome extension APIs:

- [@theluckystrike/webext-bookmarks](https://github.com/theluckystrike/webext-bookmarks) — Bookmark management
- [@theluckystrike/webext-storage](https://github.com/theluckystrike/webext-storage) — Storage abstraction
- ... and more coming soon!

## License

MIT

---

Built by [theluckystrike](https://github.com/theluckystrike) — [zovo.one](https://zovo.one)
