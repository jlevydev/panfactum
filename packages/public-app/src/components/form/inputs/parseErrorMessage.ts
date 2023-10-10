// Form error messages that are created via React Admin will sometimes have this string prefix
// and this function helps extract the actual error message for display to the user
const regex = /@@react-admin@@"(.+)"/
export default function parseErrorMessage (message: string): string {
  const raRegexMatch = message.match(regex)
  if (raRegexMatch) {
    const match = raRegexMatch[1]
    if (match) {
      return match
    }
  }
  return message
}
