import type { UserTable } from './User'
import type { OrganizationTable } from './Organization'
import type { UserOrganizationTable } from './UserOrganization'
import type { UserLoginSession } from './UserLoginSession'
import type { BrandTable } from './Brand'
import type { ContractTable } from './Contract'
import type { DealTable } from './Deal'
import type { DealContractTable } from './DealContract'
import type { DeliverableTable } from './Deliverable'
import type { ReachSnapshotTable } from './ReachSnapshot'
import type { DealDeliverableTable } from './DealDeliverable'
import type { IndustryTable } from './Industry'

export interface Database {
    brand: BrandTable
    contract: ContractTable
    deal: DealTable
    deal_contract: DealContractTable
    deal_deliverable: DealDeliverableTable
    deliverable: DeliverableTable
    industry: IndustryTable
    organization: OrganizationTable
    reach_snapshot: ReachSnapshotTable
    user: UserTable
    user_organization: UserOrganizationTable
    user_login_session: UserLoginSession
}
