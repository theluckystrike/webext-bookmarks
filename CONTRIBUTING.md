# Contributing to @theluckystrike/webext-bookmarks

Thank you for your interest in contributing! This project follows the Zovo open-source guidelines.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/webext-bookmarks.git`
3. **Install dependencies**: `pnpm install`

## Development

```bash
# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

## Project Structure

```
webext-bookmarks/
├── src/
│   ├── index.ts      # Main library code
│   └── __tests__/   # Test files
├── CHANGELOG.md     # Version history
├── LICENSE          # MIT license
├── package.json     # Package configuration
└── tsconfig.json    # TypeScript configuration
```

## Code Style

- Use **TypeScript** for all new code
- Follow existing code formatting (2-space indentation)
- Add JSDoc comments for exported functions
- Write tests for new functionality

## Testing

Tests use Vitest. Write tests that verify:

- Basic CRUD operations
- Event listener behavior
- Error handling

```typescript
// Example test structure
import { describe, it, expect, vi } from 'vitest';
import * as bookmarks from '../src/index';

describe('bookmarks.create', () => {
  it('should create a bookmark', async () => {
    const result = await bookmarks.create({
      title: 'Test',
      url: 'https://example.com'
    });
    expect(result.title).toBe('Test');
  });
});
```

## Submitting Changes

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Add tests if applicable
4. Build and test: `pnpm build && pnpm test`
5. Commit with a clear message: `git commit -m "feat: add search by URL"`
6. Push to your fork: `git push origin feat/my-feature`
7. Open a Pull Request

## Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `test:` — Adding or updating tests
- `chore:` — Build, tooling, dependencies

## Release Process

1. Update `CHANGELOG.md` with version and changes
2. Update version in `package.json`
3. Create a git tag: `git tag v1.0.1`
4. Push tag: `git push --tags`
5. GitHub Actions will publish to npm

## Code of Conduct

Be respectful and constructive. We're a small team building tools we love.

## Questions?

Open an issue for bugs, feature requests, or questions.
