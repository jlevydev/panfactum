export interface PackageTable {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    repositoryUrl: string | null;
    homepageUrl: string | null;
    documentationUrl: string | null;
    packageType: 'node' | 'oci';
    createdAt: Date;
    updatedAt: Date;
}
