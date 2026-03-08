[![CI](https://github.com/theluckystrike/webext-bookmarks/actions/workflows/ci.yml/badge.svg)](https://github.com/theluckystrike/webext-bookmarks/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Last Commit](https://img.shields.io/github/last-commit/theluckystrike/webext-bookmarks)](https://github.com/theluckystrike/webext-bookmarks/commits/main)
[![Stars](https://img.shields.io/github/stars/theluckystrike/webext-bookmarks)](https://github.com/theluckystrike/webext-bookmarks)

# @theluckystrike/webext-bookmarks

Typed bookmark helpers for Chrome extensions. Part of @zovo/webext.

Provides fully typed TypeScript wrappers around the Chrome `bookmarks` API with improved ergonomics and automatic type inference.

## Installation

```bash
npm install @theluckystrike/webext-bookmarks
```

```bash
pnpm add @theluckystrike/webext-bookmarks
```

## Usage

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

## API Reference

### Functions

#### `getTree(): Promise<chrome.bookmarks.BookmarkTreeNode[]>`
Gets the entire bookmark tree.

#### `getChildren(id: string): Promise<chrome.bookmarks.BookmarkTreeNode[]>`
Gets all children of a specific bookmark folder.

**Parameters:**
- `id` - The folder ID to get children from

#### `search(query: string | { query?: string; url?: string; title?: string }): Promise<chrome.bookmarks.BookmarkTreeNode[]>`
Searches for bookmarks.

**Parameters:**
- `query` - Search query string or search parameters object

#### `create(bookmark: BookmarkCreateArg): Promise<chrome.bookmarks.BookmarkTreeNode>`
Creates a new bookmark.

**Parameters:**
- `bookmark` - Bookmark creation options
  - `parentId?: string` - Parent folder ID
  - `title: string` - Bookmark title
  - `url?: string` - Bookmark URL
  - `index?: number` - Position in folder

#### `update(id: string, changes: BookmarkUpdateArg): Promise<chrome.bookmarks.BookmarkTreeNode>`
Updates an existing bookmark.

**Parameters:**
- `id` - Bookmark ID to update
- `changes` - Changes to apply
  - `title?: string` - New title
  - `url?: string` - New URL

#### `remove(id: string): Promise<void>`
Removes a single bookmark (non-recursive).

**Parameters:**
- `id` - Bookmark ID to remove

#### `removeTree(id: string): Promise<void>`
Removes a bookmark and all its children recursively.

**Parameters:**
- `id` - Bookmark ID to remove

#### `move(id: string, dest: BookmarkMoveArg): Promise<chrome.bookmarks.BookmarkTreeNode>`
Moves a bookmark to a new location.

**Parameters:**
- `id` - Bookmark ID to move
- `dest` - Destination
  - `parentId?: string` - New parent folder
  - `index?: number` - New position in folder

### Event Listeners

All event listeners return an unsubscribe function.

#### `onCreated(cb: (id: string, bookmark: chrome.bookmarks.BookmarkTreeNode) => void): () => void`
Listen for bookmark creation events.

#### `onRemoved(cb: (id: string, removeInfo: { parentId: string; index: number }) => void): () => void`
Listen for bookmark removal events.

#### `onChanged(cb: (id: string, changeInfo: { title: string; url?: string }) => void): () => void`
Listen for bookmark change events (title or URL).

#### `onMoved(cb: (id: string, moveInfo: { parentId: string; index: number; oldParentId: string; oldIndex: number }) => void): () => void`
Listen for bookmark move events.

### Types

#### `BookmarkCreateArg`
```typescript
interface BookmarkCreateArg {
  parentId?: string;
  title: string;
  url?: string;
  index?: number;
}
```

#### `BookmarkUpdateArg`
```typescript
interface BookmarkUpdateArg {
  title?: string;
  url?: string;
}
```

#### `BookmarkMoveArg`
```typescript
interface BookmarkMoveArg {
  parentId?: string;
  index?: number;
}
```

## Project Structure

```
webext-bookmarks/
├── src/
│   ├── index.ts          # Main source code
│   └── __tests__/
│       └── index.test.ts # Unit tests
├── .github/
│   └── workflows/
│       └── ci.yml       # CI configuration
├── CHANGELOG.md          # Version history
├── LICENSE               # MIT license
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## License

MIT

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)
