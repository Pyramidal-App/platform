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
 * Helps define a query builder object.
 */
class Search extends BusinessAction {
  /**
   * The model to query over.
   * @abstract
   */
  model = undefined

  /**
   * An object where keys are filter names, and values are
   * functions that implement these filters.
   * @abstract
   */
  filters = {}

  /*
   * @abstract
   * @private
   */
  async executePerform () {
    const queryOptions = await this._getQueryOptions()
    const results = await this.model.findAll(queryOptions)
    return results
  }

  /*
   * Returns options passed to `model.findAll(...)`
   * @private
   * @raises {UndefinedSearchFilterError}
   */
  async _getQueryOptions () {
    let accumulator = {
      where: {},
      include: [],
      transaction: this.transaction
    }

    for (const [filterName, filterValue] of toPairs(this.params.filters)) {
      const fn = this.filters[filterName]
      if (!fn) { throw new UndefinedSearchFilterError(filterName) }
      accumulator = await fn(accumulator, filterValue, this.params)
    }

    return accumulator
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
