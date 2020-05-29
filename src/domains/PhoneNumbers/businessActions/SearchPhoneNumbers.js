import seq from 'sequelize'

import Search, { includeOnce, order, select, where } from '$src/Search'
import fulltextFilter from '$src/Search/search_filters/fulltextFilter'
import { PhoneNumber, Call } from '$src/models'

class SearchPhoneNumbers extends Search {
  static model = PhoneNumber

  static orderableBy = [
    'createdAt',
    'countryCode',
    'areaCode',
    'number',
    ['lastInteractionDate', (queryOptions, direction) => (
      queryOptions
      |> includeOnce(#, { model: Call, required: false })
      |> order(#, [{ model: Call }, 'createdAt', direction])
    )]
  ]

  static filters = {
    fulltext: fulltextFilter('phone_numbers_document("PhoneNumber")')
  }
}

export default SearchPhoneNumbers
