import {
  Edit,
  required,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar
} from 'react-admin'

function MyToolbar () {
  return (
    <Toolbar className="flex justify-between">
      <SaveButton label="Save" />
    </Toolbar>
  )
}

interface IAllOrgBasicProps{
  orgId: string;
}
export default function AllOrgBasic (props: IAllOrgBasicProps) {
  return (
    <Edit
      resource="allOrgs"
      id={props.orgId}
      component="div"
    >
      <SimpleForm toolbar={<MyToolbar/>}>
        <div className="flex flex-col gap-4">
          <div className="flex md:gap-12 flex-wrap">
            <TextInput
              className="w-full md:w-72"
              variant="outlined"
              label="Name"
              source="name"
              validate={required()}
            />
          </div>
        </div>
      </SimpleForm>
    </Edit>
  )
}
