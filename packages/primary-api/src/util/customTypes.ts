import { Type } from '@sinclair/typebox'

export function StringEnum<T extends string[]> (values: [...T], description: string, defaultField?: T[number]) {
  return Type.Unsafe<T[number]>({ type: 'string', enum: values, description, default: defaultField })
}
