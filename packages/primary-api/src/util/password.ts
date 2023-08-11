import { createHmac, randomBytes } from 'crypto'

export function createPasswordSalt () {
  return randomBytes(64).toString('base64')
}
export function createPasswordHash (password: string, salt:string): string {
  const hash = createHmac('sha512', salt)
  hash.update(password)
  return hash.digest('base64')
}
