import { faker } from '@faker-js/faker'
import type { Selectable } from 'kysely'

import type { OrganizationTableSeed } from './Organization.seed'
import type { PackageTable } from './Package'
import { getDB } from '../db'

export type PackageTableSeed = Selectable<PackageTable>

export function createRandomPackage (org: OrganizationTableSeed): PackageTableSeed {
  const createdAt = faker.date.soon({ days: 100, refDate: org.createdAt })
  const updatedAt = faker.date.soon({ days: 100, refDate: createdAt })
  const archivedAt = faker.datatype.boolean(0.80) ? null : faker.date.soon({ days: 100, refDate: updatedAt })
  const deletedAt = archivedAt === null ? null : faker.datatype.boolean(0.50) ? null : faker.date.soon({ days: 100, refDate: archivedAt })
  return {
    id: faker.string.uuid(),
    organizationId: org.id,
    name: faker.commerce.productName().replace(' ', '-').toLowerCase(),
    description: faker.commerce.productDescription(),
    repositoryUrl: faker.datatype.boolean() ? null : `https://${faker.internet.domainName()}`,
    homepageUrl: faker.datatype.boolean() ? null : `https://${faker.internet.domainName()}`,
    documentationUrl: faker.datatype.boolean() ? null : `https://${faker.internet.domainName()}`,
    packageType: faker.helpers.arrayElement(['node', 'oci']),
    createdAt,
    updatedAt,
    archivedAt,
    deletedAt
  }
}

export async function seedPackageTable (organizations: OrganizationTableSeed[], maxPerOrg = 10) {
  const teamOrgs = organizations.filter(org => !org.isUnitary)
  const packages = teamOrgs.map(org => {
    return [...Array(faker.number.int({ min: 1, max: maxPerOrg })).keys()]
      .map(() => createRandomPackage(org))
  }).flat()
  await (await getDB()).insertInto('package')
    .values(packages)
    .execute()
  return packages
}

export async function truncatePackageTable () {
  await (await getDB()).deleteFrom('package')
    .execute()
}
