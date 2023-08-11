export interface UserOrganizationTable {
    user_id: string;
    organization_id: string;
    role: 'admin' | 'manager' | 'viewer';
    active: boolean;
    added_at: Date
}
