import update from 'lodash.update'
import toPairs from 'lodash.topairs'
import BusinessAction from '$src/BusinessAction'

/**
 * Raised when a search is called with a filter that is not defined.
 */
class UndefinedSearchFilterError extends Error {
  constructor(filterName) {
    super(`Filter definition for "${filterName}" is undefined`)
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
  model = undefined

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
  filters = {}

  /**
   * @constructor
   * @param limit Number of records to retrieve
   * @param orderBy  of records to retrieve
   * @param filters of records to retrieve
   */
  constructor({ limit, orderBy = [], filters = {}, page, recordsPerPage }, ...args) {
    super({ limit, orderBy, filters, page, recordsPerPage }, ...args)
  }

  /*
   * @abstract
   * @private
   */
  async executePerform () {
    const queryOptions = await this._queryOptions()

    const { rows, count } =
      await this.model.findAndCountAll(queryOptions)

    return {
      page: this._page(),
      totalPages: Math.ceil(count / this._recordsPerPage()),
      recordsPerPage: this._recordsPerPage(),
      total: count,
      data: rows,
    }
  }

  /*
   * Returns options passed to `model.findAll(...)`
   * @private
   * @raises {UndefinedSearchFilterError}
   */
  async _queryOptions() {
    let accumulator = {
      where: {},
      include: [],
      order: [],
      transaction: this.transaction,
      limit: this._recordsPerPage(),
      offset: this._page() && this._page() - 1
    }

    for (const [filterName, filterValue] of toPairs(this.params.filters)) {
      const fn = this.constructor.filters[filterName]
      if (!fn) { throw new UndefinedSearchFilterError(filterName) }
      accumulator = await fn(accumulator, filterValue, this.params)
    }

    for (const { identifier, direction } of this.params.orderBy) {
      if (this.constructor.orderableBy.includes(identifier)) {
        accumulator = update(accumulator, 'order', order => [...order, [identifier, direction]] )
      }
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

export { where, include }
export default Search
