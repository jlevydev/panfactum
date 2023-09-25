import type { Generated } from 'kysely'

export interface UserTable {
    id: Generated<string>;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    passwordSalt: string;
    passwordHash: string;
    panfactumRole: 'admin' | null;
}
