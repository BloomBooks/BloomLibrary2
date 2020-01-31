// This is related to the "show" column on book in ParseServer
export class ArtifactVisibilitySettings {
    public harvester: boolean | undefined;
    public librarian: boolean | undefined;
    public user: boolean | undefined;

    constructor(
        harvester?: boolean | undefined,
        librarian?: boolean | undefined,
        user?: boolean | undefined
    ) {
        this.harvester = harvester;
        this.librarian = librarian;
        this.user = user;
    }

    public getUserDecision = (): boolean | undefined => {
        return this.user;
    };

    public hasHarvesterDecided = (): boolean => {
        return this.harvester !== undefined;
    };

    public isHarvesterHide = (): boolean => {
        return this.harvester === false;
    };

    public hasLibrarianDecided = (): boolean => {
        return this.librarian !== undefined;
    };

    public isLibrarianHide = (): boolean => {
        return this.librarian === false;
    };

    public getDecisionSansUser = (): boolean => {
        if (this.hasLibrarianDecided()) {
            return !this.isLibrarianHide();
        }
        return !this.isHarvesterHide();
    };
}
