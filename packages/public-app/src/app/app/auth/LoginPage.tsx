import Link from 'next/link'
import { FormEventHandler, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postLogin } from '@/lib/clients/api/postLogin'
import { useQueryClient } from 'react-query'

export default function LoginPage () {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginStatus, setLoginStatus] = useState<'unsubmitted' | 'failed' | 'success'>('unsubmitted')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    postLogin(email, password)
      .then(() => {
        void queryClient.refetchQueries(['auth', 'getIdentity'])
        navigate('/', { replace: true })
      })
      .catch(() => {
        setLoginStatus('failed')
      }
      )
  }

  return (
    <div className="bg-base-300 flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <Link href="/">
            <h1 className="text-primary text-4xl text-center font-bold leading-tight tracking-tight md:text-5xl">
              Panfactum
            </h1>
          </Link>
          <h2 className="text-black text-xl font-bold leading-tight tracking-tight md:text-2xl">
            Sign in to your account
          </h2>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="email"
                className="text-black block mb-2 text-xl"
              >
                Email
              </label>
              <input
                autoFocus={true}
                tabIndex={1}
                type="email"
                name="email"
                id="email"
                className="text-lg rounded-lg focus:ring-primary-600 focus:border-primary block w-full p-2.5"
                placeholder="name@company.com"
                required={true}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor="password"
                  className="text-black mb-2 text-xl"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot Password
                </Link>
              </div>
              <input
                tabIndex={2}
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-primary focus:border-primary-600 block w-full p-2.5"
                required={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              tabIndex={3}
              className="w-full text-white bg-primary hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-xl px-5 py-2.5 text-center"
            >
              Sign in
            </button>
            {loginStatus === 'failed' && (
              <p className="text-error text-lg font-bold">
                Invalid username or password
              </p>
            )}
            <p className="text-lg font-light text-black">
              Don’t have an account yet?
              {' '}
              <Link
                href="/sign-up"
                className="text-primary hover:underline"
                tabIndex={4}
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
