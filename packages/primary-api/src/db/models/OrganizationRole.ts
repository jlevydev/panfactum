import type { Generated } from 'kysely'

export interface OrganizationRoleTable {
    id: Generated<string>;
    organizationId: string | null;
    name: string;
}
