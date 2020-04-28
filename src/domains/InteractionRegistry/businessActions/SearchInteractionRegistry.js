import Search from '$src/Search'
import { Call } from '$src/models'

class SearchInteractionRegistry extends Search {
  model = Call
  static orderableBy = ['createdAt', 'dateTime']
  filters = {}
}

export default SearchInteractionRegistry
