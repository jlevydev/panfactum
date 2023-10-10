export interface Rules {
  required?: string;
  maxLength?: {
    value: number
    message: string
  }
  minLength?: {
    value: number
    message: string
  }
  max?: {
    value: number
    message: string
  }
  min?: {
    value: number
    message: string
  }
  pattern?: {
    value: RegExp
    message: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate?: {[name: string]: (value: any) => true | string}
}

const linkRegex = /^(?:(?:(?:https?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/
export function linkValidation (errorMessage?: string) {
  return (value: string | null | undefined) => {
    if (!value) {
      return true
    } else if (!value.match(linkRegex)) {
      return errorMessage ?? `${value} is not a valid link`
    } else {
      return true
    }
  }
}

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
export function emailValidation (errorMessage?: string) {
  return (value: string | null | undefined) => {
    if (!value) {
      return true
    } else if (!value.match(emailRegex)) {
      return errorMessage ?? `${value} is not a valid email address`
    } else {
      return true
    }
  }
}
