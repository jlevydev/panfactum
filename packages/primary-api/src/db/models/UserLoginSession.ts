export interface UserLoginSession {
    id: string; // This is NOT generated in the db for performance reasons
    userId: string;
    masqueradingUserId: string | null;
    createdAt: Date;
    lastApiCallAt: Date | null;
}
