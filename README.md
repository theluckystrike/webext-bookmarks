[![CI](https://github.com/theluckystrike/webext-bookmarks/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-bookmarks/actions)
[![npm](https://img.shields.io/npm/v/@anthropic/webext-bookmarks)](https://www.npmjs.com/package/@anthropic/webext-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

# @anthropic/webext-bookmarks

Typed bookmark helpers for Chrome extensions. Part of @zovo/webext.

## Installation

```bash
pnpm add @anthropic/webext-bookmarks
```

## Usage

```typescript
import * as bookmarks from '@anthropic/webext-bookmarks';

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

## API

### Functions

- `getTree()` - Get the entire bookmark tree
- `getChildren(id)` - Get children of a specific folder
- `search(query)` - Search bookmarks by query string or object
- `create(bookmark)` - Create a new bookmark
- `update(id, changes)` - Update an existing bookmark
- `remove(id)` - Remove a bookmark (non-recursive)
- `removeTree(id)` - Remove a bookmark and all its children
- `move(id, dest)` - Move a bookmark to a new location

### Event Listeners

- `onCreated(cb)` - Listen for bookmark creation
- `onRemoved(cb)` - Listen for bookmark removal
- `onChanged(cb)` - Listen for bookmark changes
- `onMoved(cb)` - Listen for bookmark moves

All event listeners return a function to unsubscribe.


---

Built by [theluckystrike](https://github.com/theluckystrike) — [zovo.one](https://zovo.one)
