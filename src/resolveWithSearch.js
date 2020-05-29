import withApolloServerErrorAdapting from '$src/withApolloServerErrorAdapting'
import visibleToUser from '$src/Search/search_filters/visibleToUser'

/**
* A HOF that takes a search object constructor and returns a GQL resolver function.
*/
const resolveWithSearch = (
  searchConstructor,
  {
    filterVisibleToUser = true,
    queryOptions = record => ({})
  } = {}
) => (
  withApolloServerErrorAdapting(async (record, { input = {} }, { currentUser }) => {
    const params =
      filterVisibleToUser ?
      visibleToUser(input, currentUser.id) :
      {}

    const search = new searchConstructor(
      { ...queryOptions(record), ...input },
      currentUser
    )

    const result = await search.perform()

    return result
  })
)

export default resolveWithSearch
