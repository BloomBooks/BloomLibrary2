// Factory for creating repository instances with dependency injection
import {
    IBookRepository,
    IUserRepository,
    ILanguageRepository,
    ITagRepository,
    IAuthenticationService,
    IAnalyticsService,
} from "../interfaces";

// Forward declarations for implementations that will be created later
interface RepositoryImplementations {
    ParseBookRepository: new () => IBookRepository;
    ParseUserRepository: new () => IUserRepository;
    ParseLanguageRepository: new () => ILanguageRepository;
    ParseTagRepository: new () => ITagRepository;
    ParseAuthenticationService: new () => IAuthenticationService;
    ParseAnalyticsService: new () => IAnalyticsService;
}

export enum DataLayerImplementation {
    ParseServer = "parseserver",
    Supabase = "supabase", // For future use
    Mock = "mock", // For testing
}

export class DataLayerFactory {
    private static instance: DataLayerFactory;
    private currentImplementation: DataLayerImplementation =
        DataLayerImplementation.ParseServer;
    private implementations: Partial<RepositoryImplementations> = {};

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    public static getInstance(): DataLayerFactory {
        if (!DataLayerFactory.instance) {
            DataLayerFactory.instance = new DataLayerFactory();
        }
        return DataLayerFactory.instance;
    }

    // Configuration methods
    public setImplementation(implementation: DataLayerImplementation): void {
        this.currentImplementation = implementation;
    }

    public getCurrentImplementation(): DataLayerImplementation {
        return this.currentImplementation;
    }

    // Register implementation classes (to be called during app initialization)
    public registerImplementations(
        implementations: Partial<RepositoryImplementations>
    ): void {
        this.implementations = { ...this.implementations, ...implementations };
    }

    // Repository factory methods
    public createBookRepository(): IBookRepository {
        switch (this.currentImplementation) {
            case DataLayerImplementation.ParseServer:
                if (!this.implementations.ParseBookRepository) {
                    throw new Error(
                        "ParseBookRepository implementation not registered"
                    );
                }
                return new this.implementations.ParseBookRepository();

            case DataLayerImplementation.Mock:
                // Will implement when we create mock implementations
                throw new Error("Mock implementation not yet available");

            case DataLayerImplementation.Supabase:
                // Will implement during Supabase migration
                throw new Error("Supabase implementation not yet available");

            default:
                throw new Error(
                    `Unknown implementation: ${this.currentImplementation}`
                );
        }
    }

    public createUserRepository(): IUserRepository {
        switch (this.currentImplementation) {
            case DataLayerImplementation.ParseServer:
                if (!this.implementations.ParseUserRepository) {
                    throw new Error(
                        "ParseUserRepository implementation not registered"
                    );
                }
                return new this.implementations.ParseUserRepository();

            case DataLayerImplementation.Mock:
                throw new Error("Mock implementation not yet available");

            case DataLayerImplementation.Supabase:
                throw new Error("Supabase implementation not yet available");

            default:
                throw new Error(
                    `Unknown implementation: ${this.currentImplementation}`
                );
        }
    }

    public createLanguageRepository(): ILanguageRepository {
        switch (this.currentImplementation) {
            case DataLayerImplementation.ParseServer:
                if (!this.implementations.ParseLanguageRepository) {
                    throw new Error(
                        "ParseLanguageRepository implementation not registered"
                    );
                }
                return new this.implementations.ParseLanguageRepository();

            case DataLayerImplementation.Mock:
                throw new Error("Mock implementation not yet available");

            case DataLayerImplementation.Supabase:
                throw new Error("Supabase implementation not yet available");

            default:
                throw new Error(
                    `Unknown implementation: ${this.currentImplementation}`
                );
        }
    }

    public createTagRepository(): ITagRepository {
        switch (this.currentImplementation) {
            case DataLayerImplementation.ParseServer:
                if (!this.implementations.ParseTagRepository) {
                    throw new Error(
                        "ParseTagRepository implementation not registered"
                    );
                }
                return new this.implementations.ParseTagRepository();

            case DataLayerImplementation.Mock:
                throw new Error("Mock implementation not yet available");

            case DataLayerImplementation.Supabase:
                throw new Error("Supabase implementation not yet available");

            default:
                throw new Error(
                    `Unknown implementation: ${this.currentImplementation}`
                );
        }
    }

    public createAuthenticationService(): IAuthenticationService {
        switch (this.currentImplementation) {
            case DataLayerImplementation.ParseServer:
                if (!this.implementations.ParseAuthenticationService) {
                    throw new Error(
                        "ParseAuthenticationService implementation not registered"
                    );
                }
                return new this.implementations.ParseAuthenticationService();

            case DataLayerImplementation.Mock:
                throw new Error("Mock implementation not yet available");

            case DataLayerImplementation.Supabase:
                throw new Error("Supabase implementation not yet available");

            default:
                throw new Error(
                    `Unknown implementation: ${this.currentImplementation}`
                );
        }
    }

    public createAnalyticsService(): IAnalyticsService {
        switch (this.currentImplementation) {
            case DataLayerImplementation.ParseServer:
                if (!this.implementations.ParseAnalyticsService) {
                    throw new Error(
                        "ParseAnalyticsService implementation not registered"
                    );
                }
                return new this.implementations.ParseAnalyticsService();

            case DataLayerImplementation.Mock:
                throw new Error("Mock implementation not yet available");

            case DataLayerImplementation.Supabase:
                throw new Error("Supabase implementation not yet available");

            default:
                throw new Error(
                    `Unknown implementation: ${this.currentImplementation}`
                );
        }
    }

    // Convenience method to create all repositories at once
    public createRepositories() {
        return {
            bookRepository: this.createBookRepository(),
            userRepository: this.createUserRepository(),
            languageRepository: this.createLanguageRepository(),
            tagRepository: this.createTagRepository(),
            authenticationService: this.createAuthenticationService(),
            analyticsService: this.createAnalyticsService(),
        };
    }
}
