import type { Generated } from 'kysely'

export interface OrganizationTable {
    id: Generated<string>;
    name: string;
    isUnitary: boolean;
    createdAt: Date;
    deletedAt: Date | null;
    updatedAt: Date;
}
