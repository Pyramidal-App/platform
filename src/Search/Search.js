import seq, { Op } from 'sequelize'
import isEqual from 'lodash.isequal'

import update from 'lodash.update'
import toPairs from 'lodash.topairs'

import BusinessAction from '$src/BusinessAction'

/**
 * A helper to manipulate queryOptions object
 */
const include = ({ include = [], ...queryOptions }, newInclude) => ({
  ...queryOptions,
  include: [...include, newInclude]
})

/**
 * A helper to manipulate queryOptions object
 */
const includeOnce = (queryOptions, newInclude) => {
  if (queryOptions.include?.find(i => isEqual(i, newInclude))) {
    return queryOptions
  }

  return include(queryOptions, newInclude)
}

/**
 * A helper to manipulate queryOptions object
 */
const where = ({ where = {}, ...queryOptions }, whereClause) => ({
  ...queryOptions,
  where: { [Op.and]: [...(where[Op.and] || []), whereClause] }
})

/**
 * A helper to manipulate queryOptions object
 */
const order = ({ order = [], ...queryOptions}, newOrder) => ({
  ...queryOptions,
  order: [...order, newOrder]
})

/**
 * A helper to manipulate queryOptions object
 */
//const select = ({ attributes = {}, ...queryOptions}, attribute) => ({
  //...queryOptions,
  //attributes: {...attributes, include: [...(attributes.include || []), attribute] }
//})
const select = ({ attributes = [], ...queryOptions}, attribute) => ({
  ...queryOptions,
  attributes: [ ...attributes, attribute]
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
   * @abstract
   * @private
   */
  async executePerform () {
    const queryOptions = await this._queryOptions()

    const { rows, count } =
      await this.constructor.model.findAndCountAll(queryOptions)

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
      distinct: true,
      includeIgnoreAttributes: false,
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
      accumulator = this.constructor._orderDefinition(identifier)(accumulator, direction)
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

  static _orderDefinition(identifier) {
    let definition

    for (const val of this.orderableBy) {
      if (Array.isArray(val) && val[0] === identifier) {
        definition = val[1]
        break
      } else if (val === identifier) {
        definition = (queryOptions, direction) => order(queryOptions, [identifier, direction])
        break
      }
    }

    if (!definition) {
      throw new UnsupportedSearchOrderIdentifier(identifier)
    }

    return definition
  }
}

export { where, include, includeOnce, order, select }
export default Search
