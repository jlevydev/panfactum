import Alert from '@mui/material/Alert'
import type { OrganizationRolesResultType } from '@panfactum/primary-api'
import type { FieldValues } from 'react-hook-form'

import type { IBasicFormProps } from '@/components/form/BasicForm'
import BasicForm from '@/components/form/BasicForm'
import FormSection from '@/components/form/FormSection'
import PermissionInput from '@/components/form/inputs/PermissionInput'
import TextInput from '@/components/form/inputs/TextInput'
import GenericMemo from '@/components/util/GenericMemo'

/************************************************
 * Root
 * **********************************************/
interface RoleEditBaseProps<T> extends Omit<IBasicFormProps<T>, 'children'> {
  isGlobalRole?: boolean
}
export default GenericMemo(function RoleEditBase<T extends FieldValues> (props: RoleEditBaseProps<T>) {
  const { isGlobalRole, ...formProps } = props
  return (
    <BasicForm
      {...formProps}
    >
      <FormSection>
        {isGlobalRole && (
          <Alert
            className="text-sm lg:text-base"
            severity="info"
          >
            This is a predefined, global role that cannot be edited.
          </Alert>
        )}
        <TextInput<OrganizationRolesResultType>
          helpText="The display name of this role"
          required={true}
          label="Name"
          name="name"
          rules={{
            required: 'Your role must have a name'
          }}
        />
        <TextInput<OrganizationRolesResultType>
          helpText="A brief description overviewing the purpose of this role"
          multiline
          required={true}
          label="Description"
          name="description"
          rules={{
            required: 'Your role must have a description'
          }}
        />
        <PermissionInput
          name="organization"
          label="Organization"
          helpText="Controls access to global organization settings (see Settings under Org Management)"
        />
        <PermissionInput
          name="membership"
          label="Team"
          helpText="Controls access to organization membership and role assignments (see Team under Org Management)"
        />
        <PermissionInput
          name="subscription"
          label="Subscriptions"
          helpText="Controls access to organization subscriptions (see Subscriptions under Purchasing). Note: Every organization user will be able to utilize purchased subscriptions regardless of this status."
        />
        <PermissionInput
          name="subscription_billing"
          label="Subscription Billing"
          helpText="Controls access to the subscription billing dashboard which includes invoice amounts and payment details (see Billing under Purchasing)"
        />
        <PermissionInput
          name="package"
          label="Packages"
          helpText="Controls access to package publishing and metadata management (see Packages under Selling)"
        />
        <PermissionInput
          name="repository"
          label="Repositories"
          helpText="Controls access to repositories and metadata management (see Repos under Selling)"
        />
        <PermissionInput
          name="storefront"
          label="Storefronts"
          helpText="Controls access to storefront information including storefront offerings, public site information, pricing, etc.  (see Storefronts under Selling)"
        />
        <PermissionInput
          name="storefront_billing"
          label="Storefront Payments"
          helpText="Controls access to storefront money management utilities including reimbursements, funds disbursement, etc. (see Payments under Selling)"
        />
      </FormSection>
    </BasicForm>
  )
})
