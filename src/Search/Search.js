import update from 'lodash.update'
import toPairs from 'lodash.topairs'
import BusinessAction from '$src/BusinessAction'

import visibleToUser from './search_filters/visibleToUser'

/**
 * A helper to manipulate queryOptions object
 */
const include = ({ include, ...queryOptions }, newInclude) => ({
  ...queryOptions,
  include: [...include, ...newInclude]
})

/**
 * A helper to manipulate queryOptions object
 */
const where = ({ where, ...queryOptions }, whereClauses) => ({
  ...queryOptions,
  where: { ...where, ...whereClauses }
})

/**
 * Raised when a search is called with a filter that is not defined.
 */
class UndefinedSearchFilterError extends Error {
  constructor(filterName) {
    super(`Filter definition for "${filterName}" is missing`)
  }
}

class UnsupportedSearchOrderIdentifier extends Error  {
  constructor(identifier) {
    super(`Unsupported search order identifier ${identifier}`)
  }
}

/**
 * @abstract
 * @extends {BusinessAction}
 * Helps define a query builder object.
 */
class Search extends BusinessAction {
  /**
   * The model to query over.
   * @abstract
   */
  static model = undefined

  /**
   * Override with an object.
   * Used to define filter resolvers.
   * Keys are filter name that point to reducer functions.
   * The accumulated value is passed to `model.findlAll()`
   * @abstract
   */
  static filters = undefined

  /**
   * Records returned per page. Only used as fallback when params.recordsPerPage
   * was not provided. Data is only paginated if params.page is present.
   * @abstract
   * @type {int}
   */
  static recordsPerPage = 10

  /**
   * An object where keys are filter names, and values are
   * functions that implement these filters.
   * @abstract
   */
  static filters = {}

  /**
   * @constructor
   * @param {array} orderBy Order to sort records by
   * @param {object} filters of records to retrieve
   * @param {integer} page
   * @param {integer} recordsPerPage
   * @param {object} queryOptions Options passed to model.findAndCountAll
   */
  constructor({
    orderBy = [],
    filters = {},
    page,
    recordsPerPage,
    queryOptions = {}
  }, ...args) {
    super({ orderBy, filters, page, recordsPerPage, queryOptions }, ...args)
  }

  /*
   * @todo This either needs killing or a compliment. Not sure.
   */
  static visibleToUser(userId) {
    return class extends this {
      async _queryOptions(...args) {
        return (
          super._queryOptions(...args)
          |> await(#)
          |> visibleToUser(#, userId)
        )
      }
    }
  }

  /*
   * @abstract
   * @private
   */
  async executePerform () {
    const queryOptions = await this._queryOptions()

    const { rows, count } =
      await this.constructor.model.findAndCountAll(queryOptions)

    debugger

    return {
      page: this._page(),
      totalPages: Math.ceil(count / this._recordsPerPage()),
      recordsPerPage: this._recordsPerPage(),
      total: count,
      data: rows
    }
  }

  /*
   * Returns options passed to `model.findAll(...)`
   * @private
   * @raises {UndefinedSearchFilterError}
   */
  async _queryOptions() {
    let accumulator = {
      where: this.params.queryOptions.where || {},
      include: this.params.queryOptions.include || [],
      order: this.params.queryOptions.order || [],
      transaction: this.transaction,
      limit: this._recordsPerPage(),
      offset: this._page() && (this._page() - 1) * this._recordsPerPage()
    }

    for (const [filterName, filterValue] of toPairs(this.params.filters)) {
      const fn = this.constructor.filters[filterName]
      if (!fn) { throw new UndefinedSearchFilterError(filterName) }
      accumulator = await fn(accumulator, filterValue, this.params)
    }

    for (const { identifier, direction } of this.params.orderBy) {
      if (!this.constructor.orderableBy.includes(identifier)) {
        throw new UnsupportedSearchOrderIdentifier(identifier)
      }

      accumulator = update(accumulator, 'order', order => [...order, [identifier, direction]] )
    }

    return accumulator
  }

  _recordsPerPage() {
    if (this._page() === undefined) { return }
    return this.params.recordsPerPage || this.recordsPerPage || this.constructor.recordsPerPage
  }

  _page() {
    return this.params.page
  }
}

export { where, include }
export default Search
