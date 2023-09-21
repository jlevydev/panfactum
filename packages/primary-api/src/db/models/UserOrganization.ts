export interface UserOrganizationTable {
    userId: string;
    organizationId: string;
    role: 'admin' | 'manager' | 'viewer';
    active: boolean;
    createdAt: Date
}
