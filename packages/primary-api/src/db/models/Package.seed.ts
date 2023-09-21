import { faker } from '@faker-js/faker'
import type { PackageTable } from './Package'
import type { OrganizationTable } from './Organization'
import { getDB } from '../db'

export function createRandomPackage (org: OrganizationTable): PackageTable {
  const createdAt = faker.date.soon({ days: 100, refDate: org.createdAt })
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
    updatedAt: faker.date.soon({ days: 100, refDate: createdAt })
  }
}

export async function seedPackageTable (organizations: OrganizationTable[], maxPerOrg = 10) {
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
