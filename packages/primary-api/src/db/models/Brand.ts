export interface BrandTable {
    id: string;
    name: string;
    address1: string | null;
    address2: string | null;
    city: string | null;
    zip: string | null;
    state: string | null;
    country: string | null;
    verified: boolean;
}
