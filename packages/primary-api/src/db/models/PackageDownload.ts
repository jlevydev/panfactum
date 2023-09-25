import type { Generated } from 'kysely'

export interface PackageDownloadTable {
    id: Generated<string>;
    packageId: string;
    versionTag: string;
    userId: string;
    createdAt: Date;
    ip: string;
}
