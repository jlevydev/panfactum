import { Type } from '@sinclair/typebox'
import { StringEnum } from '../../util/customTypes'

export const PackageId = Type.String({
  format: 'uuid',
  description: 'Unique identifier for the package'
})
export const PackageOrganizationId = Type.String({
  format: 'uuid',
  description: 'The organization that owns the package'
})
export const PackageName = Type.String({
  minLength: 1,
  description: 'The name of the package'
})
export const PackageDescription = Type.String({
  minLength: 1,
  description: 'A description of the package contents'
})
export const PackageRepositoryUrl = Type.Union([
  Type.Null(),
  Type.String({ format: 'uri' })
], { description: "A link to the version control system hosting the package's source code" })
export const PackageHomepageUrl = Type.Union([
  Type.Null(),
  Type.String({ format: 'uri' })
], { description: "A link to the package's landing page or marketing site" })
export const PackageDocumentationUrl = Type.Union([
  Type.Null(),
  Type.String({ format: 'uri' })
], { description: 'A link to the a website with documentation for how to use the package' })
export const PackageType = StringEnum(
  ['node', 'oci'],
  'The format and ecosystem of the package'
)
export const PackageCreatedAt = Type.Integer({
  minimum: 0,
  description: 'When the package was created. Unix timestamp in seconds.'
})
export const PackageArchivedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the package was archived. Unix timestamp in seconds. `null` if not archived.' })
export const PackageIsArchived = Type.Boolean({
  description: 'True iff the package has been archived. Derived from `archivedAt`.'
})
export const PackageDeletedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the package was deleted. Unix timestamp in seconds. `null` if not deleted.' })
export const PackageIsDeleted = Type.Boolean({
  description: 'True iff the package has been deleted. Derived from `deletedAt`.'
})
export const PackageUpdatedAt = Type.Integer({
  minimum: 0,
  description: 'When the package metadata was last updated. Unix timestamp in seconds.'
})
export const PackageActiveVersionCount = Type.Integer({
  minimum: 0,
  description: 'The number of package versions that are active'
})
export const PackageLastPublishedAt = Type.Union([
  Type.Integer({
    minimum: 0
  }),
  Type.Null()
], { description: 'When the last package version was published. Unix timestamp in seconds.' })
export const PackageIsPublished = Type.Boolean({
  description: 'True iff the package has at least one version available for download.'
})
export const PackageVersionId = Type.String({
  format: 'uuid',
  description: 'The internal unique identifier for this package version.'
})
export const PackageVersionPackageId = Type.String({
  format: 'uuid',
  description: 'The id of the package this package version is a version of'
})
export const PackageVersionPackageName = Type.String({
  minLength: 1,
  description: 'The name of the package this package version is a version of'
})
export const PackageVersionTag = Type.String({
  minLength: 1,
  description: 'The slug for this package version. Must be unique per package.'
})
export const PackageVersionSizeBytes = Type.Integer({
  minimum: 0,
  description: "The size of the package's underlying files in bytes"
})
export const PackageVersionCreatedBy = Type.String({
  format: 'uuid',
  description: 'The id of the user who created this package'
})
export const PackageVersionCreatedAt = Type.Integer({
  minimum: 0,
  description: 'When the package version was created. Unix timestamp in seconds.'
})
export const PackageVersionArchivedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the package version was archived. Unix timestamp in seconds. `null` if not archived.' })
export const PackageVersionIsArchived = Type.Boolean({
  description: 'True iff the package version has been archived. Derived from `archivedAt`.'
})
export const PackageVersionDeletedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the package version was deleted. Unix timestamp in seconds. `null` if not deleted.' })
export const PackageVersionIsDeleted = Type.Boolean({
  description: 'True iff the package version has been deleted. Derived from `deletedAt`.'
})
export const PackageVersionDownloadCount = Type.Integer({
  minimum: 0,
  description: 'The number of times this package version has been download.'
})
export const PackageDownloadId = Type.String({
  format: 'uuid',
  description: 'The unique identifier for the download event'
})
export const PackageDownloadVersionId = Type.String({
  format: 'uuid',
  description: 'The package version that was downloaded'
})
export const PackageDownloadUserId = Type.String({
  format: 'uuid',
  description: 'The id of the user who initiated the download'
})
export const PackageDownloadCreatedAt = Type.Integer({
  minimum: 0,
  description: 'When download occurred. Unix timestamp in seconds.'
})
export const PackageDownloadIP = Type.String({
  format: 'ipv4',
  description: 'The ip address of the location from which the package was downloaded'
})
