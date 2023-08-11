export interface ReachSnapshotTable {
    id: string;
    organization_id: string;
    collected_at: Date;
    instagram_followers: number | null;
    tiktok_followers: number | null;
    youtube_subscribers: number | null;
}
