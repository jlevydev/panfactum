import type { Generated } from 'kysely'

export interface PackageVersionTable {
    id: Generated<string>;
    packageId: string;
    versionTag: string;
    sizeBytes: number;
    createdAt: Date;
    createdBy: string;
    archivedAt: Date | null;
    deletedAt: Date | null;
}
