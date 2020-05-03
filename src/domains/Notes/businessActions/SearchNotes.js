import Search from '$src/Search'
import { Note } from '$src/models'
import opFilter from '$src/Search/search_filters/opFilter'

class SearchNotes extends Search {
  static model = Note
  static orderableBy = ['createdAt']
  static filters = {
    customerId: opFilter('CustomerId')
  }
}

export default SearchNotes
