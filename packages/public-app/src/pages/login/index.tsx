import { KeyboardEvent, useState } from 'react'
import { useRouter } from 'next/router'

import { postLogin } from '../../clients/api/postLogin'

export default function Login () {
  const { push } = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginStatus, setLoginStatus] = useState<'unsubmitted' | 'failed' | 'success'>('unsubmitted')

  const onLogin = async (): Promise<void> => {
    if (await postLogin(email, password)) {
      setLoginStatus('success')
      void push('/dashboard/youtube')
    } else {
      setLoginStatus('failed')
    }
  }

  const onEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      void onLogin()
    }
  }

  return (
    <div
      className="w-full max-w-xs"
    >
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={onLogin}
      >
        <div
          className="mb-4"
        >
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div
          className="mb-6"
        >
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onKeyDown={onEnter}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div
          className="flex items-center justify-between"
        >
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={onLogin}
          >
            Sign In
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="#"
          >
            Forgot Password?
          </a>
        </div>
        {loginStatus === 'failed'
          ? (
            <div
              className="flex items-center justify-center mt-5"
            >
              <p
                className="font-bold text-red-600"
              >
                Login Failure
              </p>
            </div>
          )
          : null}
      </form>
    </div>
  )
}
