# Anti-Corruption Layer Migration Plan: ParseServer to Supabase

## Executive Summary

This plan outlines the introduction of an anti-corruption layer to isolate ParseServer dependencies and enable a big-bang migration to Supabase. The layer will provide TypeScript interfaces that abstract all data access operations, with ParseServer-specific code confined to a single directory structure.

## Current Progress Status 📊

**Completed:** 12/18 major steps (67% complete)

✅ **Foundation Complete (Steps 1-6):**
- Full directory structure established
- All repository interfaces defined (IBookRepository, IUserRepository, ILanguageRepository, ITagRepository, IAuthenticationService, IAnalyticsService)
- Complete type system with CommonTypes, QueryTypes, FilterTypes
- Business models implemented (BookModel, UserModel, LanguageModel, TagModel) with extracted business logic
- Singleton DataLayerFactory with implementation switching capability
- ParseServer connection logic extracted and authentication service implemented

✅ **ParseBookRepository Complete (Steps 7-8):**
- Full IBookRepository implementation with all 12 required methods
- Data conversion between ParseServer format and BookModel
- Support for complex queries, filtering, pagination, search, and related books
- Integration with existing constructParseBookQuery function
- Comprehensive error handling and unit test foundation
- Successfully builds and compiles without errors

✅ **User, Language, Tag Layer Complete (Steps 9-12):**
- ParseUserRepository implements full IUserRepository contract with moderator checks and permissions bridge
- ParseAuthenticationService fulfills IAuthenticationService using data layer abstractions and Firebase integration
- ParseLanguageRepository supplies language queries and normalization utilities
- ParseTagRepository delivers tag lookup, validation, and processing logic
- Data layer registration wired into application bootstrap and Firebase auth flow switched to factory service
- New unit tests cover repository and service contracts through interface-based mocks

🔄 **Currently Working:** Steps 13-14 - Application Integration & Tests

**Remaining:** Steps 13-18 (application layer updates, comprehensive testing, mocks, validation)

## Goals

1. **Isolation**: Confine all ParseServer-specific code to a dedicated directory
2. **Interface Definition**: Create clean TypeScript interfaces for all data operations
3. **Testing**: Ensure unit tests validate current behavior through the interface layer
4. **Migration Readiness**: Enable straightforward Supabase implementation replacement
5. **Maintainability**: Keep business logic separate from data persistence concerns

## Current State Analysis

### Data Models Identified
Based on codebase analysis, the following entities interact with ParseServer:

1. **Core Entities**:
   - `Book` - Main content entity with complex metadata
   - `User` - Authentication and user management
   - `Language` - Language metadata and localization
   - `Collection` - Content organization (from Contentful, but queries books)
   - `Tag` - Classification and filtering system

2. **Supporting Entities**:
   - `ArtifactVisibilitySettings` - Book artifact permissions
   - `RelatedBooks` - Book relationships
   - Statistics/Analytics data (separate API but references books)

### Current ParseServer Operations
- **Authentication**: Firebase + ParseServer dual authentication
- **CRUD Operations**: Books, Users, Languages, Tags
- **Complex Queries**: Filtered searches, faceted search, aggregations
- **File Operations**: Book content and metadata
- **Analytics Integration**: Stats queries linking to book data

## Anti-Corruption Layer Design

### Directory Structure
```
src/
├── data-layer/
│   ├── interfaces/           # Clean business interfaces
│   │   ├── IBookRepository.ts
│   │   ├── IUserRepository.ts
│   │   ├── ILanguageRepository.ts
│   │   ├── ITagRepository.ts
│   │   ├── IAuthenticationService.ts
│   │   ├── IAnalyticsService.ts
│   │   └── index.ts
│   ├── models/              # Business domain models
│   │   ├── BookModel.ts
│   │   ├── UserModel.ts
│   │   ├── LanguageModel.ts
│   │   └── index.ts
│   ├── implementations/     # Current ParseServer implementation
│   │   ├── parseserver/
│   │   │   ├── ParseBookRepository.ts
│   │   │   ├── ParseUserRepository.ts
│   │   │   ├── ParseLanguageRepository.ts
│   │   │   ├── ParseTagRepository.ts
│   │   │   ├── ParseAuthenticationService.ts
│   │   │   ├── ParseConnection.ts
│   │   │   ├── ParseQueryBuilder.ts
│   │   │   └── index.ts
│   │   └── supabase/        # Future Supabase implementation
│   │       └── (to be implemented)
│   ├── types/               # Shared types and enums
│   │   ├── QueryTypes.ts
│   │   ├── FilterTypes.ts
│   │   └── CommonTypes.ts
│   └── factory/             # Repository factory for DI
│       └── DataLayerFactory.ts
```

### Core Interfaces

#### IBookRepository
```typescript
export interface IBookRepository {
  // Basic CRUD
  getBook(id: string): Promise<BookModel | null>;
  getBooks(ids: string[]): Promise<BookModel[]>;
  searchBooks(query: BookSearchQuery): Promise<BookSearchResult>;
  updateBook(id: string, updates: Partial<BookModel>): Promise<void>;
  deleteBook(id: string): Promise<void>;

  // Complex queries
  getBooksForGrid(filter: BookFilter, pagination: Pagination, sorting: Sorting[]): Promise<BookGridResult>;
  getBookCount(filter: BookFilter): Promise<number>;
  getRelatedBooks(bookId: string): Promise<BookModel[]>;

  // Specialized operations
  getBookDetail(id: string): Promise<BookModel | null>;
  saveArtifactVisibility(id: string, settings: ArtifactVisibilitySettings): Promise<void>;
}
```

#### IUserRepository
```typescript
export interface IUserRepository {
  getUser(id: string): Promise<UserModel | null>;
  getUserByEmail(email: string): Promise<UserModel | null>;
  createUser(userData: CreateUserData): Promise<UserModel>;
  updateUser(id: string, updates: Partial<UserModel>): Promise<void>;
  checkUserIsModerator(userId: string): Promise<boolean>;
}
```

#### IAuthenticationService
```typescript
export interface IAuthenticationService {
  connectUser(jwtToken: string, userId: string): Promise<UserModel>;
  logout(): Promise<void>;
  getCurrentUser(): UserModel | undefined;
  onAuthStateChanged(callback: (user: UserModel | undefined) => void): void;
}
```

#### ILanguageRepository
```typescript
export interface ILanguageRepository {
  getLanguages(): Promise<LanguageModel[]>;
  getLanguageByCode(isoCode: string): Promise<LanguageModel | null>;
  getCleanedAndOrderedLanguageList(): Promise<LanguageModel[]>;
}
```

### Business Models

#### BookModel
```typescript
export class BookModel {
  // Core identification
  id: string;
  bookInstanceId: string;
  title: string;
  baseUrl: string;

  // Metadata
  allTitles: Map<string, string>;
  languages: LanguageModel[];
  tags: string[];
  features: string[];
  publisher: string;
  originalPublisher: string;
  copyright: string;
  license: string;

  // Content
  pageCount: string;
  summary: string;
  credits: string;

  // State management
  harvestState: string;
  inCirculation: boolean;
  draft: boolean;

  // Artifact settings
  artifactsToOfferToUsers: ArtifactVisibilitySettingsGroup;

  // Analytics
  stats: BookStatsModel;

  // Dates
  createdAt: Date;
  updatedAt: Date;
  lastUploaded?: Date;

  // Business methods
  getBestLevel(): string | undefined;
  getTagValue(tag: string): string | undefined;
  setBooleanTag(name: string, value: boolean): void;
  // ... other business logic methods
}
```

### Query and Filter Types

#### BookFilter
```typescript
export interface BookFilter {
  language?: string;
  publisher?: string;
  originalPublisher?: string;
  bookshelf?: string;
  feature?: string;
  topic?: string;
  inCirculation?: BooleanOptions;
  draft?: BooleanOptions;
  search?: string;
  keywordsText?: string;
  brandingProjectName?: string;
  derivedFrom?: BookFilter;
  derivedFromCollectionName?: string;
  anyOfThese?: BookFilter[];
}
```

#### BookSearchQuery
```typescript
export interface BookSearchQuery {
  filter: BookFilter;
  orderingScheme?: BookOrderingScheme;
  pagination?: Pagination;
  fieldSelection?: string[];
}
```

### Repository Factory

```typescript
export class DataLayerFactory {
  private static instance: DataLayerFactory;

  static getInstance(): DataLayerFactory {
    if (!this.instance) {
      this.instance = new DataLayerFactory();
    }
    return this.instance;
  }

  createBookRepository(): IBookRepository {
    // Currently returns ParseServer implementation
    // Will switch to Supabase during migration
    return new ParseBookRepository();
  }

  createUserRepository(): IUserRepository {
    return new ParseUserRepository();
  }

  createAuthenticationService(): IAuthenticationService {
    return new ParseAuthenticationService();
  }

  // ... other repository creators
}
```

### Step 1: Create Data Layer Directory Structure ✅ COMPLETED
- [x] Create `src/data-layer/` directory
- [x] Create `src/data-layer/interfaces/` directory
- [x] Create `src/data-layer/models/` directory
- [x] Create `src/data-layer/implementations/parseserver/` directory
- [x] Create `src/data-layer/types/` directory
- [x] Create `src/data-layer/factory/` directory

### Step 2: Define Core Interfaces ✅ COMPLETED
- [x] Create `src/data-layer/interfaces/IBookRepository.ts` with all book operations
- [x] Create `src/data-layer/interfaces/IUserRepository.ts` with user management
- [x] Create `src/data-layer/interfaces/ILanguageRepository.ts` with language operations
- [x] Create `src/data-layer/interfaces/ITagRepository.ts` with tag management
- [x] Create `src/data-layer/interfaces/IAuthenticationService.ts` with auth operations
- [x] Create `src/data-layer/interfaces/IAnalyticsService.ts` with stats operations
- [x] Create `src/data-layer/interfaces/index.ts` to export all interfaces

### Step 3: Define Types and Enums ✅ COMPLETED
- [x] Create `src/data-layer/types/CommonTypes.ts` with shared types
- [x] Create `src/data-layer/types/QueryTypes.ts` with query-related types
- [x] Create `src/data-layer/types/FilterTypes.ts` with filter definitions
- [x] Extract and move `BooleanOptions` enum to common types
- [x] Extract and move `BookOrderingScheme` enum to common types

### Step 4: Create Business Models ✅ COMPLETED
- [x] Create `src/data-layer/models/BookModel.ts` with clean business logic
- [x] Create `src/data-layer/models/UserModel.ts` with user domain logic
- [x] Create `src/data-layer/models/LanguageModel.ts` with language logic
- [x] Create `src/data-layer/models/TagModel.ts` with tag domain logic
- [x] Create `src/data-layer/models/index.ts` to export all models
- [x] Move business methods from current `Book` class to `BookModel`

### Step 5: Implement Repository Factory ✅ COMPLETED
- [x] Create `src/data-layer/factory/DataLayerFactory.ts`
- [x] Implement singleton pattern for factory
- [x] Add methods to create each repository type
- [x] Add configuration for switching implementations

### Step 6: Extract ParseServer Connection Logic ✅ COMPLETED
- [x] Move `src/connection/ParseServerConnection.ts` to `src/data-layer/implementations/parseserver/ParseConnection.ts`
- [x] Create `src/data-layer/implementations/parseserver/ParseAuthenticationService.ts`
- [x] Extract connection headers and URL management
- [x] Extract authentication logic (connectUser, logout, session management)

### Step 7: Implement ParseServer Repository Classes ✅ COMPLETED
- [x] Create `src/data-layer/implementations/parseserver/ParseBookRepository.ts`
- [x] Create `src/data-layer/implementations/parseserver/ParseUserRepository.ts`
- [x] Create `src/data-layer/implementations/parseserver/ParseLanguageRepository.ts`
- [x] Create `src/data-layer/implementations/parseserver/ParseTagRepository.ts`
- [x] Create `src/data-layer/implementations/parseserver/ParseAuthenticationService.ts`
- [x] Create `src/data-layer/implementations/parseserver/index.ts`

### Step 8: Migrate Book Repository Implementation ✅ COMPLETED
- [x] Implement `getBook()` method from `useGetBookDetail`
- [x] Implement `searchBooks()` method from `useSearchBooks`
- [x] Implement `getBooksForGrid()` method from `useGetBooksForGrid`
- [x] Implement `updateBook()` method from `LibraryUpdates.updateBook`
- [x] Implement `getBookCount()` method from `useGetBookCount`
- [x] Implement `getRelatedBooks()` method from `useGetRelatedBooks`
- [x] Implement `saveArtifactVisibility()` method from Book class
- [x] Implement `getBasicBookInfos()` and `getCurrentBookData()` methods
- [x] Add comprehensive data conversion between Parse format and BookModel
- [x] Add proper error handling and logging

### Step 9: Migrate User Repository Implementation ✅ COMPLETED
- [x] Implement user CRUD operations from `LoggedInUser.ts`
- [x] Implement `checkUserIsModerator()` functionality
- [x] Move user session management logic behind repository

### Step 10: Migrate Authentication Service Implementation ✅ COMPLETED
- [x] Implement `connectUser()` from `connectParseServer`
- [x] Implement `logout()` functionality
- [x] Implement `getCurrentUser()` from `LoggedInUser.current`
- [x] Integrate with Firebase authentication flow via data-layer factory
- [x] Provide `sendConcernEmail` through authentication service

### Step 11: Migrate Language Repository Implementation ✅ COMPLETED
- [x] Implement `getLanguages()` aligned with `useGetLanguagesList`
- [x] Implement `getLanguageByCode()` from `useGetLanguageInfo`
- [x] Implement `getCleanedAndOrderedLanguageList()` functionality
- [x] Preserve legacy normalization helpers for compatibility

### Step 12: Migrate Tag Repository Implementation ✅ COMPLETED
- [x] Implement tag list retrieval from `useGetTagList`
- [x] Implement tag search and filtering operations
- [x] Add validation and processing utilities for book workflows

### Step 13: Update Application Layer to Use Repositories
- [ ] Update `LibraryQueryHooks.ts` to use repository factory
- [ ] Replace direct ParseServer calls in hooks with repository methods
- [ ] Update components that directly import connection utilities
- [ ] Update authentication hooks to use authentication service
- [ ] Update error handling to work with repository pattern

### Step 14: Create Tests for Repository Implementations
- [x] Create interface-based tests for `ParseUserRepository`
- [x] Create interface-based tests for `ParseLanguageRepository`
- [x] Create interface-based tests for `ParseTagRepository`
- [x] Create interface-based tests for `ParseAuthenticationService`
- [ ] Create interface-based tests for `ParseBookRepository`
- [ ] Write tests that validate against dev ParseServer for read operations
- [ ] Test all query variations and edge cases
- [ ] Test authentication flows
- [ ] Test error handling scenarios


### Step 16: Update Existing Unit Tests
- [ ] Audit existing test files for direct ParseServer usage
- [ ] Update tests to use mock repositories instead of ParseServer
- [ ] Ensure all business logic tests still pass
- [ ] Update test data setup to work with new models

### Step 17: Validate Repository Behavior
- [ ] Run comprehensive tests against repository implementations
- [ ] Compare behavior with original ParseServer integration
- [ ] Test all CRUD operations and complex queries

### Step 18: Final Cleanup and Validation
- [ ] Remove any remaining direct ParseServer imports from business logic
- [ ] Ensure all ParseServer code is in `implementations/parseserver/` directory
- [ ] Run full application test suite
- [ ] Validate that all existing functionality works through new layer
- [ ] Performance testing to ensure no regressions



