/**
 * Typed bookmark helpers for Chrome extensions
 */

export interface BookmarkCreateArg {
  parentId?: string;
  title: string;
  url?: string;
  index?: number;
}

export interface BookmarkUpdateArg {
  title?: string;
  url?: string;
}

export interface BookmarkMoveArg {
  parentId?: string;
  index?: number;
}

/**
 * Get the entire bookmark tree
 */
export async function getTree(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  return chrome.bookmarks.getTree();
}

/**
 * Get children of a specific bookmark folder
 * @param id - The folder ID to get children from
 */
export async function getChildren(id: string): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  return chrome.bookmarks.getChildren(id);
}

/**
 * Search for bookmarks
 * @param query - Search query or search parameters
 */
export async function search(
  query: string | { query?: string; url?: string; title?: string }
): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  if (typeof query === 'string') {
    return chrome.bookmarks.search(query);
  }
  return chrome.bookmarks.search(query);
}

/**
 * Create a new bookmark
 * @param bookmark - The bookmark to create
 */
export async function create(
  bookmark: BookmarkCreateArg
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return chrome.bookmarks.create(bookmark);
}

/**
 * Update an existing bookmark
 * @param id - The bookmark ID to update
 * @param changes - The changes to apply
 */
export async function update(
  id: string,
  changes: BookmarkUpdateArg
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return chrome.bookmarks.update(id, changes);
}

/**
 * Remove a bookmark (non-recursive)
 * @param id - The bookmark ID to remove
 */
export async function remove(id: string): Promise<void> {
  return chrome.bookmarks.remove(id);
}

/**
 * Remove a bookmark and all its children (recursive)
 * @param id - The bookmark ID to remove
 */
export async function removeTree(id: string): Promise<void> {
  return chrome.bookmarks.removeTree(id);
}

/**
 * Move a bookmark to a new location
 * @param id - The bookmark ID to move
 * @param dest - The destination (parentId and/or index)
 */
export async function move(
  id: string,
  dest: BookmarkMoveArg
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return chrome.bookmarks.move(id, dest);
}

/**
 * Listen for bookmark creation events
 * @param cb - Callback function
 * @returns Function to remove the listener
 */
export function onCreated(
  cb: (id: string, bookmark: chrome.bookmarks.BookmarkTreeNode) => void
): () => void {
  const listener = (
    id: string,
    bookmark: chrome.bookmarks.BookmarkTreeNode
  ) => {
    cb(id, bookmark);
  };
  chrome.bookmarks.onCreated.addListener(listener);
  return () => {
    chrome.bookmarks.onCreated.removeListener(listener);
  };
}

/**
 * Listen for bookmark removal events
 * @param cb - Callback function
 * @returns Function to remove the listener
 */
export function onRemoved(
  cb: (id: string, removeInfo: { parentId: string; index: number }) => void
): () => void {
  const listener = (
    id: string,
    removeInfo: { parentId: string; index: number }
  ) => {
    cb(id, removeInfo);
  };
  chrome.bookmarks.onRemoved.addListener(listener);
  return () => {
    chrome.bookmarks.onRemoved.removeListener(listener);
  };
}

/**
 * Listen for bookmark change events
 * @param cb - Callback function
 * @returns Function to remove the listener
 */
export function onChanged(
  cb: (id: string, changeInfo: { title: string; url?: string }) => void
): () => void {
  const listener = (
    id: string,
    changeInfo: { title: string; url?: string }
  ) => {
    cb(id, changeInfo);
  };
  chrome.bookmarks.onChanged.addListener(listener);
  return () => {
    chrome.bookmarks.onChanged.removeListener(listener);
  };
}

/**
 * Listen for bookmark move events
 * @param cb - Callback function
 * @returns Function to remove the listener
 */
export function onMoved(
  cb: (
    id: string,
    moveInfo: {
      parentId: string;
      index: number;
      oldParentId: string;
      oldIndex: number;
    }
  ) => void
): () => void {
  const listener = (
    id: string,
    moveInfo: {
      parentId: string;
      index: number;
      oldParentId: string;
      oldIndex: number;
    }
  ) => {
    cb(id, moveInfo);
  };
  chrome.bookmarks.onMoved.addListener(listener);
  return () => {
    chrome.bookmarks.onMoved.removeListener(listener);
  };
}
