export interface UserTable {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    added_at: Date;
    password_salt: string;
    password_hash: string;
}
