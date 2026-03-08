<div align="center">

# @theluckystrike/webext-bookmarks

Typed bookmark helpers for Chrome extensions. Create, search, move, and organize bookmarks with full TypeScript support.

[![npm version](https://img.shields.io/npm/v/@theluckystrike/webext-bookmarks)](https://www.npmjs.com/package/@theluckystrike/webext-bookmarks)
[![npm downloads](https://img.shields.io/npm/dm/@theluckystrike/webext-bookmarks)](https://www.npmjs.com/package/@theluckystrike/webext-bookmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@theluckystrike/webext-bookmarks)

[Installation](#installation) · [Quick Start](#quick-start) · [API](#api) · [License](#license)

</div>

---

## Features

- **Full CRUD** -- create, read, update, delete bookmarks
- **Search** -- find bookmarks by title or URL
- **Tree traversal** -- get bookmark tree and subtrees
- **Move + reorder** -- move bookmarks between folders
- **Event listeners** -- subscribe to bookmark created/removed/changed/moved events
- **Fully typed** -- TypeScript types for all bookmark operations

## Installation

```bash
npm install @theluckystrike/webext-bookmarks
```

<details>
<summary>Other package managers</summary>

```bash
pnpm add @theluckystrike/webext-bookmarks
# or
yarn add @theluckystrike/webext-bookmarks
```

</details>

## Quick Start

```typescript
import { Bookmarks } from "@theluckystrike/webext-bookmarks";

const results = await Bookmarks.search("github");
const bookmark = await Bookmarks.create({ title: "GitHub", url: "https://github.com" });
const tree = await Bookmarks.getTree();
await Bookmarks.remove(bookmark.id);
```

## API

| Method | Description |
|--------|-------------|
| `getTree()` | Get the full bookmark tree |
| `getSubTree(id)` | Get a subtree by folder ID |
| `get(id)` | Get a single bookmark |
| `getChildren(id)` | Get children of a folder |
| `search(query)` | Search bookmarks by title or URL |
| `create(details)` | Create a bookmark or folder |
| `update(id, changes)` | Update title or URL |
| `move(id, destination)` | Move to a different folder |
| `remove(id)` | Delete a bookmark |
| `removeTree(id)` | Delete a folder and all contents |

## Permissions

```json
{ "permissions": ["bookmarks"] }
```

## Part of @zovo/webext

This package is part of the [@zovo/webext](https://github.com/theluckystrike) family -- typed, modular utilities for Chrome extension development:

| Package | Description |
|---------|-------------|
| [webext-storage](https://github.com/theluckystrike/webext-storage) | Typed storage with schema validation |
| [webext-messaging](https://github.com/theluckystrike/webext-messaging) | Type-safe message passing |
| [webext-tabs](https://github.com/theluckystrike/webext-tabs) | Tab query helpers |
| [webext-cookies](https://github.com/theluckystrike/webext-cookies) | Promise-based cookies API |
| [webext-i18n](https://github.com/theluckystrike/webext-i18n) | Internationalization toolkit |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License -- see [LICENSE](LICENSE) for details.

---

<div align="center">

Built by [theluckystrike](https://github.com/theluckystrike) · [zovo.one](https://zovo.one)

</div>
