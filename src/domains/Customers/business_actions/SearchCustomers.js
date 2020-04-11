import Search, { where, include } from '$src/Search'
import { Customer, PhoneNumber } from '$src/models'
import visibleToUser from '$src/Search/search_filters/visibleToUser'

/**
 *https://9gag.com/gag/an5LgLV The decision to extend BusinessAction is temporal.
 * For now it's okay, but it feels like a bad approach.
 * On the other hand, it makes sense for a search to be "allowed",
 * which makes extending BusinessAction sound better.
 */
class SearchCustomers extends Search {
  model = Customer

  isAllowed() {
    const userId = this.params.filters.visibleToUser
    return userId && userId === this.performer.id
  }

  static filters = {
    visibleToUser,

    phoneNumber(queryOptions, value) {
      if (!value) { return queryOptions }

      const { countryCode, areaCode, number } = value

      return include(queryOptions, [{
        model: PhoneNumber,
        where: { countryCode, areaCode, number }
      }])
    }
  }
}

export default SearchCustomers
