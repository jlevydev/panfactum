import type { Generated } from 'kysely'

export interface OrganizationRoleTable {
    id: Generated<string>;
    organizationId: string | null;
    createdAt: Generated<Date>;
    updatedAt: Date | null;
    description: string | null;
    name: string;
}
