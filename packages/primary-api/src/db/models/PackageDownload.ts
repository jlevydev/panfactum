import type { Generated } from 'kysely'

export interface PackageDownloadTable {
    id: Generated<string>;
    versionId: string;
    userId: string;
    createdAt: Date;
    ip: string;
}
