import { Edit, SimpleForm, TextInput } from 'react-admin'

export default function UserEdit () {
  return (
    <Edit>
      <SimpleForm>
        <div className="flex gap-24">
          <TextInput
            variant="outlined"
            name="First Name"
            label="First Name"
            source="firstName"
          />
          <TextInput
            name="Last Name"
            label="Last Name"
            source="lastName"
            inputProps={{ style: { padding: '21px 12px 4px' } }}
          />
        </div>

      </SimpleForm>
    </Edit>
  )
}
