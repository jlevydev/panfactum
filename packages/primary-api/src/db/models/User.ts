export interface UserTable {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    passwordSalt: string;
    passwordHash: string;
    panfactumRole: 'admin' | null;
}
