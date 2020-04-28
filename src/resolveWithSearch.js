import withApolloServerErrorAdapting from '$src/withApolloServerErrorAdapting'

/**
* A HOF that takes a search object constructor and returns a GQL resolver function.
*/
const resolveWithSearch = searchConstructor => (
  withApolloServerErrorAdapting(async (_record, { input = {} }, { currentUser }) => {
    const filteredSearch = searchConstructor.visibleToUser(currentUser.id)
    const search = new filteredSearch(input, currentUser)
    const result = await search.perform()
    return result
  })
)
export default resolveWithSearch
