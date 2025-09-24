import { DataLayerFactory } from "./factory/DataLayerFactory";
import { registerParseServerImplementations } from "./implementations/parseserver";

registerParseServerImplementations();

const factory = DataLayerFactory.getInstance();

export function getBookRepository() {
    return factory.createBookRepository();
}

export function getUserRepository() {
    return factory.createUserRepository();
}

export function getLanguageRepository() {
    return factory.createLanguageRepository();
}

export function getTagRepository() {
    return factory.createTagRepository();
}

export function getAuthenticationService() {
    return factory.createAuthenticationService();
}

export function getAnalyticsService() {
    return factory.createAnalyticsService();
}
