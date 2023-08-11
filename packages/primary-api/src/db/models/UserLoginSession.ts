export interface UserLoginSession {
    id: string;
    user_id: string;
    started_at: Date;
    last_api_call_at: Date | null;
}
