import Search from '$src/Search'
import { Call } from '$src/models'

class SearchInteractionRegistry extends Search {
  static model = Call
  static orderableBy = ['createdAt', 'dateTime']
  static filters = {}
}

export default SearchInteractionRegistry
