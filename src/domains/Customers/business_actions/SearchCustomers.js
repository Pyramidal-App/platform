import Search, { where, include } from '$src/Search'
import { Customer, PhoneNumber } from '$src/models'

/**
 *https://9gag.com/gag/an5LgLV The decision to extend BusinessAction is temporal.
 * For now it's okay, but it feels like a bad approach.
 * On the other hand, it makes sense for a search to be "allowed",
 * which makes extending BusinessAction sound better.
 */
class SearchCustomers extends Search {
  model = Customer

  static orderableBy = ['createdAt']

  static filters = {
    phoneNumber(queryOptions, value) {
      if (!value) { return queryOptions }

      const { countryCode, areaCode, number } = value

      return include(queryOptions, [{
        model: PhoneNumber,
        where: { countryCode, areaCode, number }
      }])
    },

    id(queryOptions, value) {
      const id = typeof value === 'string' ? value.match(/^(\d+)/)[1] : value
      return where(queryOptions, { id })
    }
  }
}

export default SearchCustomers
