export interface DeliverableTable {
    id: string;
    platform: 'youtube' | 'tiktok' | 'instagram';
    content_type: 'post' | 'video' | 'story';
    user_posted: boolean;
    boosted: boolean;
    count: number;
}
