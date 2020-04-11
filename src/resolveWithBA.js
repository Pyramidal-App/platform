import { UserInputError, ForbiddenError } from 'apollo-server'
import {
  BusinessActionValidationError,
  BusinessActionForbiddenError
} from './BusinessAction'

/**
* A HOF that takes a business action and returns a GQL resolver function.
*/
const resolveWithBA = (BA, { passingInput = true } = {}) => async (
  _root,
  args,
  { currentUser }
) => {
  const params = passingInput ? args.input : args

  try {
    const result = await new BA(params, currentUser).perform()

    if (result === undefined) {
      return { success: true }
    } else {
      return result
    }
  } catch (error) {
    if (error instanceof BusinessActionValidationError) {
      throw new UserInputError('Validation Error', {
        originalError: error,
        errorsPerField: error.errors
      })
    }

    if (error instanceof BusinessActionForbiddenError) {
      throw new ForbiddenError('Forbidden Error', { originalError: error })
    }

    throw error
  }
}

export default resolveWithBA
