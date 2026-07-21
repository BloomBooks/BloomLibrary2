import { DataLayerFactory } from "../../factory/DataLayerFactory";
import { ParseBookRepository } from "./ParseBookRepository";
import { ParseUserRepository } from "./ParseUserRepository";
import { ParseLanguageRepository } from "./ParseLanguageRepository";
import { ParseTagRepository } from "./ParseTagRepository";
import { ParseAuthenticationService } from "./ParseAuthenticationService";

export function registerParseServerImplementations(): void {
    DataLayerFactory.getInstance().registerImplementations({
        ParseBookRepository,
        ParseUserRepository,
        ParseLanguageRepository,
        ParseTagRepository,
        ParseAuthenticationService,
    });
}
