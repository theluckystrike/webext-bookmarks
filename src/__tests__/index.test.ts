import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTree,
  getChildren,
  search,
  create,
  update,
  remove,
  removeTree,
  move,
  onCreated,
  onRemoved,
  onChanged,
  onMoved,
} from '../index';

// Mock chrome.bookmarks
const mockBookmarkTree: chrome.bookmarks.BookmarkTreeNode[] = [
  {
    id: '1',
    title: 'Bookmarks Bar',
    children: [
      {
        id: '2',
        title: 'Example',
        url: 'https://example.com',
      },
    ],
  },
];

const mockListeners: Record<string, Function[]> = {
  onCreated: [],
  onRemoved: [],
  onChanged: [],
  onMoved: [],
};

const mockChrome = {
  bookmarks: {
    getTree: vi.fn().mockResolvedValue(mockBookmarkTree),
    getChildren: vi.fn().mockResolvedValue([{ id: '2', title: 'Example', url: 'https://example.com' }]),
    search: vi.fn().mockResolvedValue([{ id: '2', title: 'Example', url: 'https://example.com' }]),
    create: vi.fn().mockResolvedValue({ id: '3', title: 'New Bookmark', url: 'https://new.com' }),
    update: vi.fn().mockResolvedValue({ id: '2', title: 'Updated', url: 'https://example.com' }),
    remove: vi.fn().mockResolvedValue(undefined),
    removeTree: vi.fn().mockResolvedValue(undefined),
    move: vi.fn().mockResolvedValue({ id: '2', title: 'Example', parentId: '5' }),
    onCreated: {
      addListener: vi.fn((cb: Function) => mockListeners.onCreated.push(cb)),
      removeListener: vi.fn((cb: Function) => {
        const idx = mockListeners.onCreated.indexOf(cb);
        if (idx > -1) mockListeners.onCreated.splice(idx, 1);
      }),
    },
    onRemoved: {
      addListener: vi.fn((cb: Function) => mockListeners.onRemoved.push(cb)),
      removeListener: vi.fn((cb: Function) => {
        const idx = mockListeners.onRemoved.indexOf(cb);
        if (idx > -1) mockListeners.onRemoved.splice(idx, 1);
      }),
    },
    onChanged: {
      addListener: vi.fn((cb: Function) => mockListeners.onChanged.push(cb)),
      removeListener: vi.fn((cb: Function) => {
        const idx = mockListeners.onChanged.indexOf(cb);
        if (idx > -1) mockListeners.onChanged.splice(idx, 1);
      }),
    },
    onMoved: {
      addListener: vi.fn((cb: Function) => mockListeners.onMoved.push(cb)),
      removeListener: vi.fn((cb: Function) => {
        const idx = mockListeners.onMoved.indexOf(cb);
        if (idx > -1) mockListeners.onMoved.splice(idx, 1);
      }),
    },
  },
};

// @ts-expect-error - global chrome
global.chrome = mockChrome;

describe('webext-bookmarks', () => {
  describe('getTree', () => {
    it('should return the bookmark tree', async () => {
      const result = await getTree();
      expect(result).toEqual(mockBookmarkTree);
      expect(chrome.bookmarks.getTree).toHaveBeenCalled();
    });
  });

  describe('getChildren', () => {
    it('should return children of a folder', async () => {
      const result = await getChildren('1');
      expect(result).toHaveLength(1);
      expect(chrome.bookmarks.getChildren).toHaveBeenCalledWith('1');
    });
  });

  describe('search', () => {
    it('should search with string query', async () => {
      const result = await search('example');
      expect(result).toHaveLength(1);
      expect(chrome.bookmarks.search).toHaveBeenCalledWith('example');
    });

    it('should search with object query', async () => {
      const result = await search({ title: 'Example', url: 'https://example.com' });
      expect(result).toHaveLength(1);
      expect(chrome.bookmarks.search).toHaveBeenCalledWith({ title: 'Example', url: 'https://example.com' });
    });
  });

  describe('create', () => {
    it('should create a bookmark', async () => {
      const bookmark = { title: 'New Bookmark', url: 'https://new.com' };
      const result = await create(bookmark);
      expect(result).toEqual({ id: '3', title: 'New Bookmark', url: 'https://new.com' });
      expect(chrome.bookmarks.create).toHaveBeenCalledWith(bookmark);
    });
  });

  describe('update', () => {
    it('should update a bookmark', async () => {
      const changes = { title: 'Updated' };
      const result = await update('2', changes);
      expect(result).toEqual({ id: '2', title: 'Updated', url: 'https://example.com' });
      expect(chrome.bookmarks.update).toHaveBeenCalledWith('2', changes);
    });
  });

  describe('remove', () => {
    it('should remove a bookmark', async () => {
      await remove('2');
      expect(chrome.bookmarks.remove).toHaveBeenCalledWith('2');
    });
  });

  describe('removeTree', () => {
    it('should remove a bookmark and its children', async () => {
      await removeTree('1');
      expect(chrome.bookmarks.removeTree).toHaveBeenCalledWith('1');
    });
  });

  describe('move', () => {
    it('should move a bookmark', async () => {
      const dest = { parentId: '5', index: 0 };
      const result = await move('2', dest);
      expect(result).toEqual({ id: '2', title: 'Example', parentId: '5' });
      expect(chrome.bookmarks.move).toHaveBeenCalledWith('2', dest);
    });
  });

  describe('event listeners', () => {
    it('should add and remove onCreated listener', () => {
      const cb = vi.fn();
      const removeListener = onCreated(cb);
      
      expect(chrome.bookmarks.onCreated.addListener).toHaveBeenCalled();
      
      // Simulate event
      mockListeners.onCreated.forEach(listener => listener('3', { id: '3', title: 'Test' }));
      expect(cb).toHaveBeenCalledWith('3', { id: '3', title: 'Test' });
      
      // Remove listener
      removeListener();
      expect(chrome.bookmarks.onCreated.removeListener).toHaveBeenCalled();
    });

    it('should add and remove onRemoved listener', () => {
      const cb = vi.fn();
      const removeListener = onRemoved(cb);
      
      expect(chrome.bookmarks.onRemoved.addListener).toHaveBeenCalled();
      
      // Simulate event
      mockListeners.onRemoved.forEach(listener => listener('2', { parentId: '1', index: 0 }));
      expect(cb).toHaveBeenCalledWith('2', { parentId: '1', index: 0 });
      
      removeListener();
      expect(chrome.bookmarks.onRemoved.removeListener).toHaveBeenCalled();
    });

    it('should add and remove onChanged listener', () => {
      const cb = vi.fn();
      const removeListener = onChanged(cb);
      
      expect(chrome.bookmarks.onChanged.addListener).toHaveBeenCalled();
      
      // Simulate event
      mockListeners.onChanged.forEach(listener => listener('2', { title: 'Changed', url: 'https://example.com' }));
      expect(cb).toHaveBeenCalledWith('2', { title: 'Changed', url: 'https://example.com' });
      
      removeListener();
      expect(chrome.bookmarks.onChanged.removeListener).toHaveBeenCalled();
    });

    it('should add and remove onMoved listener', () => {
      const cb = vi.fn();
      const removeListener = onMoved(cb);
      
      expect(chrome.bookmarks.onMoved.addListener).toHaveBeenCalled();
      
      // Simulate event
      mockListeners.onMoved.forEach(listener => listener('2', { parentId: '5', index: 1, oldParentId: '1', oldIndex: 0 }));
      expect(cb).toHaveBeenCalledWith('2', { parentId: '5', index: 1, oldParentId: '1', oldIndex: 0 });
      
      removeListener();
      expect(chrome.bookmarks.onMoved.removeListener).toHaveBeenCalled();
    });
  });
});
