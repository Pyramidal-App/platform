import Search from '$src/Search'
import opFilter from '$src/Search/search_filters/opFilter'
import { Interaction } from '$src/models'

class SearchInteractionRegistry extends Search {
  static model = Interaction
  static orderableBy = ['createdAt', 'dateTime']

  static filters = {
    phoneNumberId: opFilter('PhoneNumberId'),
    customerId: opFilter('CustomerId')
  }
}

export default SearchInteractionRegistry
