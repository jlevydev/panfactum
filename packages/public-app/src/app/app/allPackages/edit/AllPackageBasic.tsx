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

interface IProps{
  packageId: string;
}
export default function AllPackageBasic (props: IProps) {
  return (
    <Edit
      resource="allPackages"
      id={props.packageId}
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
