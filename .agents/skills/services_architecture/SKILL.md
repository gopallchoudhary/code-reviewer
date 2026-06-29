---
name: services_architecture
description: Describes the @repo/services workspace package architecture pattern used in the code-reviewer monorepo. Triggers when working with packages/services, adding new services, writing tRPC routes that consume services, or scaffolding new domain logic.
---

# `@repo/services` Architecture Pattern

## Package Overview

`packages/services` is the business logic layer of the monorepo. It is consumed by `@repo/trpc` (server routes) and `@repo/jobs` (background tasks).

**Package name**: `@repo/services`
**Dependencies**: `@repo/auth`, `@repo/db`, `@repo/github`, `@repo/ai`, `@repo/vector-db`, `@repo/jobs`

---

## Directory Structure

Each domain gets its own subdirectory with exactly two files:

```
packages/services/
├── github/
│   ├── index.ts   ← class GithubServices
│   └── model.ts   ← Zod schemas + inferred types
├── ai/
│   ├── index.ts   ← class AiServices
│   └── model.ts
├── user/
│   ├── index.ts   ← class UserService
│   └── model.ts
├── reposync/
│   ├── index.ts   ← class ReposyncServices
│   └── model.ts
└── package.json
```

---

## Conventions to Follow

### 1. Class-based services — default export the class (NOT an instance)

```ts
class GithubServices {
    public async someMethod() { ... }
    private async internalHelper() { ... }
}

export default GithubServices
```

### 2. Instantiate at the call site

Consumers (tRPC routes, other services, jobs) create their own instance:

```ts
// In a tRPC route:
const githubService = new GithubServices()

// In another service (e.g. reposync uses user):
const userService = new UserService()
```

Never export a singleton instance from the service file itself.

### 3. Co-located `model.ts` with Zod — always infer TypeScript types from Zod schemas

```ts
// model.ts
import { z } from 'zod'

export const githubRepo = z.object({
    id: z.string(),
    name: z.string(),
    fullName: z.string(),
    visibility: z.enum(['public', 'private']),
    language: z.string().nullable().optional(),
    stars: z.number().optional().nullable(),
})

export type GithubReposType = z.infer<typeof githubRepo>
```

Never write standalone TypeScript interfaces/types for domain models — always derive from Zod.

### 4. No barrel index at the package root

There is **no** `packages/services/index.ts`. Import directly from the subdirectory:

```ts
// From outside the package:
import GithubServices from '@repo/services/github'
import UserService from '@repo/services/user'

// Within the package (relative paths):
import UserService from '../user/index'
```

### 5. Module-level constants, not class properties

Tuning values go at the top of `index.ts` as module-level constants:

```ts
const FILES_PER_PAGE = 100
const MAX_CHUNK_LINES = 80
const REPOS_PER_PAGE = 100
const MAX_FILE_SIZE_BYTES = 100_000
const UPSERT_BATCH_SIZE = 100
```

### 6. `this` binding when passing methods as callbacks

Class methods that internally call other `this.xxx()` methods must be bound when used as callbacks:

```ts
// Correct
data.repositories.map(this.mapRepo.bind(this))

// Also correct
data.repositories.map((repo) => this.mapRepo(repo))

// Wrong — this becomes undefined
data.repositories.map(this.mapRepo)
```

### 7. Section comments use `//.` style

```ts
//. Git Repo's
//. pr file
//. code chunk
```

---

## Adding a New Service

1. Create `packages/services/<domain>/model.ts` — define Zod schemas and infer types
2. Create `packages/services/<domain>/index.ts` — implement `class <Domain>Service { ... }` with `export default <Domain>Service`
3. Import in tRPC routes or jobs via `import <Domain>Service from '@repo/services/<domain>'`
4. Instantiate at the call site: `const domainService = new DomainService()`
