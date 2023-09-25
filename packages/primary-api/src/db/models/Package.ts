import type { Generated } from 'kysely'

export interface PackageTable {
    id: Generated<string>;
    organizationId: string;
    name: string;
    description: string;
    repositoryUrl: string | null;
    homepageUrl: string | null;
    documentationUrl: string | null;
    packageType: 'node' | 'oci';
    createdAt: Date;
    updatedAt: Date;
    archivedAt: Date | null;
    deletedAt: Date | null;
}
