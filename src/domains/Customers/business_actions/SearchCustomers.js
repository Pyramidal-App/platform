import seq, { Op } from 'sequelize'

import Search, { where, include } from '$src/Search'
import { Customer, PhoneNumber, Task } from '$src/models'

/**
 * The decision to extend BusinessAction is temporal.
 * For now it's okay, but it feels like a bad approach.
 * On the other hand, it makes sense for a search to be "allowed",
 * which makes extending BusinessAction sound better.
 */
class SearchCustomers extends Search {
  static model = Customer
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
    },

    inLimbo(queryOptions) {
      return where(queryOptions, {
        [Op.and]: [seq.literal(`NOT EXISTS (SELECT FROM "Tasks" WHERE "Tasks"."CustomerId" = "Customer".id AND "Tasks".status = 'PENDING')`)]
      })
    }
  }
}

export default SearchCustomers
