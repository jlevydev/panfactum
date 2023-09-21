export interface PackageVersionTable {
    packageId: string;
    versionTag: string;
    sizeBytes: number;
    createdAt: Date;
    createdBy: string;
    archivedAt: Date | null;
}
