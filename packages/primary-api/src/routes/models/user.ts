import { Type } from '@sinclair/typebox'

export const UserId = Type.String({ format: 'uuid' })
export const UserFirstName = Type.String({ minLength: 1, description: "The user's first / given name." })
export const UserLastName = Type.String({ minLength: 1, description: "The user's last name / family name / surname." })
export const UserEmail = Type.String({ format: 'email', description: "The user's email address." })
export const UserNumberOfOrgs = Type.Integer({ minimum: 1, description: 'The number of organizations the user is a member. Does not include their personal (unitary) org.' })
export const UserCreatedAt = Type.Integer({ minimum: 0, description: 'When the user was created. Unix timestamp in seconds.' })
export const UserUpdatedAt = Type.Integer({ description: 'When the user was last updated. Unix timestamp in seconds.' })
export const UserDeletedAt = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Null()
], { description: 'When the user was deleted. Unix timestamp in seconds. `null` if not deleted.' })
export const UserIsDeleted = Type.Boolean({ description: 'Whether the user has been deleted. Derived from deletedAt.' })
