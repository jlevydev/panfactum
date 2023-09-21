import type { AuthProvider, UserIdentity } from 'react-admin'
import { postLogin } from '@/lib/clients/api/postLogin'
import { postLogout } from '@/lib/clients/api/postLogout'
import { fetchAuthInfo } from '@/lib/clients/api/fetchAuthInfo'
import { APIUnauthenticatedError } from '@/lib/clients/api/apiFetch'
import { useAuthProvider } from 'react-admin'
import { postMasquerade } from '@/lib/clients/api/postMasquerade'
import { queryClient } from '@/lib/clients/query/client'
import type { LoginReturnType } from '@panfactum/primary-api'
import { postUndoMasquerade } from '@/lib/clients/api/postUndoMasquerade'
import { useQuery } from 'react-query'

/********************************************
 * Login Types
 * *******************************************/

interface ILoginWithPasswordProps {
  loginMethod: 'password'
  email: string;
  password: string;
}

interface ILoginByMasqueradeProps {
  loginMethod: 'masquerade'
  targetUserId: string;
}

interface ILoginByUndoMasqueradeProps {
  loginMethod: 'undo-masquerade'
}

type LoginProps = ILoginByMasqueradeProps | ILoginWithPasswordProps | ILoginByUndoMasqueradeProps

/********************************************
 * Identity Management Utilities
 * *******************************************/

// Our extended identity format
export interface IExtendedUserIdentity extends UserIdentity, Awaited<ReturnType<typeof fetchAuthInfo>> {}

// Extended the default auth provider with our specific
// identity format
export interface ICustomAuthProvider extends AuthProvider {
  getIdentity: () => Promise<IExtendedUserIdentity>
}

// Interfaces with react-admins query client to manually
// update its identity information
export async function renewIdentity (identity?: IExtendedUserIdentity) {
  if (!identity) {
    identity = await getIdentity()
  }
  queryClient.setQueryData(['auth', 'getIdentity'], identity)
}

// Manually reset the identity info
export async function clearIdentity () {
  return queryClient.resetQueries(['auth'])
}

// Leverages our auth endpoints to return an identity in the format
// that react-admin expects
export async function getIdentity () {
  return getIdentityFromAuthInfo(await fetchAuthInfo())
}

export function getIdentityFromAuthInfo (authInfo: LoginReturnType): IExtendedUserIdentity {
  return { ...authInfo, id: authInfo.userId }
}

// We have to use our own hook for this query as the own
// provided by react-admin only updates on component mount
export function useIdentityQuery () {
  return useQuery(
    ['auth', 'getIdentity'],
    async () => {
      return getIdentityFromAuthInfo(await fetchAuthInfo())
    }
  )
}

/********************************************
 * Auth Provider
 * *******************************************/

export const customAuthProvider: ICustomAuthProvider = {
  login: async (props: LoginProps) => {
    let newIdentity: IExtendedUserIdentity
    const { loginMethod } = props
    if (loginMethod === 'password') {
      newIdentity = getIdentityFromAuthInfo(await postLogin(props.email, props.password))
    } else if (loginMethod === 'masquerade') {
      newIdentity = getIdentityFromAuthInfo(await postMasquerade(props.targetUserId))
    } else if (loginMethod === 'undo-masquerade') {
      newIdentity = getIdentityFromAuthInfo(await postUndoMasquerade())
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported login method: ${loginMethod}`)
    }
    await renewIdentity(newIdentity)
  },
  logout: async () => {
    await postLogout()
    await clearIdentity()
  },
  checkAuth: async () => {
    await fetchAuthInfo()
  },
  checkError: async (error) => {
    if (error instanceof APIUnauthenticatedError) {
      await postLogout()
      return Promise.reject(error)
    }
    return Promise.resolve()
  },
  getIdentity: async () => {
    return getIdentityFromAuthInfo(await fetchAuthInfo())
  },
  getPermissions: () => {
    return Promise.resolve([])
  }
}

export const useCustomAuthProvider = () => {
  return useAuthProvider<typeof customAuthProvider>()
}
