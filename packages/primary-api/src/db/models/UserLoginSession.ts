export interface UserLoginSession {
    id: string;
    userId: string;
    masqueradingUserId: string | null;
    createdAt: Date;
    lastApiCallAt: Date | null;
}
