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

interface IAllUserBasicProps{
  userId: string;
}
export default function AllUserBasic (props: IAllUserBasicProps) {
  return (
    <Edit
      resource="allUsers"
      id={props.userId}
      component="div"
    >
      <SimpleForm toolbar={<MyToolbar/>}>
        <div className="flex flex-col gap-4">
          <div className="flex md:gap-12 flex-wrap">
            <TextInput
              className="w-full md:w-72"
              variant="outlined"
              label="First Name"
              source="firstName"
              validate={required()}
            />
            <TextInput
              className="w-full md:w-72"
              variant="outlined"
              label="Last Name"
              source="lastName"
              validate={required()}
            />
          </div>
        </div>
      </SimpleForm>
    </Edit>
  )
}
