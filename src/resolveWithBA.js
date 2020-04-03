import { UserInputError, ForbiddenError } from 'apollo-server'
import {
  BusinesActionValidationError,
  BusinesActionForbiddenError
} from './BusinessAction'

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
    if (error instanceof BusinesActionValidationError) {
      throw new UserInputError('Validation Error', {
        originalError: error,
        errorsPerField: error.errors
      })
    }

    if (error instanceof BusinesActionForbiddenError) {
      throw new ForbiddenError('Forbidden Error', { originalError: error })
    }

    throw error
  }
}

export default resolveWithBA
