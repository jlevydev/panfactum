export interface DealTable {
    id: string;
    organization_id: string;
    dollar_amount: number | null;
    status: 'draft' | 'reviewing' | 'verified';
    executed_at: Date | null;
    reach_snapshot_id: string | null;
    brand_id: string | null;
    industry_id: string | null;
    deadline_days_from_execution: number | null;
    effort_score: 1 | 2 | 3 | 4 | 5 | null;
    sellout_score: 1 | 2 | 3 | 4 | 5 | null;
    brand_score: 1 | 2 | 3 | 4 | 5 | null;
}
