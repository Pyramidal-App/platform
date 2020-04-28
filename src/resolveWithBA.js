import withApolloServerErrorAdapting from '$src/withApolloServerErrorAdapting'

/**
* A HOF that takes a business action and returns a GQL resolver function.
*/
const resolveWithBA = (BA, { passingInput = true } = {}) =>
  withApolloServerErrorAdapting(async (
    _root,
    args,
    { currentUser }
  ) => {
    const params = passingInput ? args.input : args

    const result = await new BA(params, currentUser).perform()

    if (result === undefined) {
      return { success: true }
    } else {
      return result
    }
  })

export default resolveWithBA
