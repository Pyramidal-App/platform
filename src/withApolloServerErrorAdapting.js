import { UserInputError, ForbiddenError } from 'apollo-server'

import {
  BusinessActionValidationError,
  BusinessActionForbiddenError
} from '$src/BusinessAction'

// HOF that catches errors and tries to re-write them as
// errors that apollo server understands
const withApolloServerErrorAdapting = fn => async (...args) => {
  try {
    return await fn(...args)
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

export default withApolloServerErrorAdapting
