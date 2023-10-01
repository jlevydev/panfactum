import {
  Edit,
  email,
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
export default function AllUserAuth (props: IAllUserBasicProps) {
  return (
    <Edit
      resource="users"
      id={props.userId}
      component="div"
    >
      <SimpleForm toolbar={<MyToolbar/>}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-12 w-full md:w-96">
            <TextInput
              fullWidth
              variant="outlined"
              label="Email"
              source="email"
              validate={[required(), email()]}
            />
          </div>
        </div>
      </SimpleForm>
    </Edit>
  )
}
