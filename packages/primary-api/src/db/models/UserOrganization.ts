import type { Generated } from 'kysely'

export interface UserOrganizationTable {
    id: Generated<string>;
    userId: string;
    organizationId: string;
    roleId: string;
    createdAt: Date;
    deletedAt: Date | null;
}
