import type { Generated } from 'kysely'

type ReadAndWrite = 'read' | 'write'
type PermissionResources = 'storefront' |
  'package' |
  'repository' |
  'storefront_billing' |
  'membership' |
  'organization' |
  'subscription' |
  'subscription_billing'

export interface OrganizationRolePermissionTable {
    id: Generated<string>;
    organizationRoleId: string;
    permission: `${ReadAndWrite}:${PermissionResources}` | 'admin';
}
