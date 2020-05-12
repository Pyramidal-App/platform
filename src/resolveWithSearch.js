import withApolloServerErrorAdapting from '$src/withApolloServerErrorAdapting'

/**
* A HOF that takes a search object constructor and returns a GQL resolver function.
*/
const resolveWithSearch = (
  searchConstructor,
  queryOptions = _record => ({})
) => (
  withApolloServerErrorAdapting(async (record, { input = {} }, { currentUser }) => {
    const filteredSearch = searchConstructor.visibleToUser(currentUser.id)

    // Tough decision. Should we give priority to client filters or server filters?
    // Maybe we should differentiate between client, permanent and default filters.
    const params = { ...input, queryOptions: queryOptions(record) }
    const search = new filteredSearch(params, currentUser)
    const result = await search.perform()

    return result
  })
)

export default resolveWithSearch
