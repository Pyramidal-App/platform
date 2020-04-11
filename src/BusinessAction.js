import update from 'lodash.update'
import merge from 'lodash.merge'

import NotImplementedError from '$src/NotImplementedError'
import validate from './validate'
import { sequelize } from './db'

const isPlainObject = obj =>
  Object.prototype.toString.call(obj) === '[object Object]'

/**
 * Raised when action validation fails.
 */
class BusinessActionValidationError extends Error {
  constructor (ba, errors) {
    super('Business action validation error')
    this.businessAction = ba
    this.errors = ba.errors
  }
}

/**
 * Raised when action is not allowed.
 */
class BusinessActionForbiddenError extends Error {
  constructor (ba) {
    super('Business action is forbidden for this performer')
    this.businessAction = ba
  }
}

/**
 * Raised when action is initialized without a performer
 */
class BusinessActionInitializationError extends Error {
  constructor (ba, message) {
    super(message, 'Wrong arguments paased to constructor')
    this.businessAction = ba
  }
}

/**
 * Abstract class.
 *
 * Represents an atomic operation on the data system, performed by a user or by system.
 *
 * Inheriting classes benefit from some sensible defaults,
 * like transaction wrapping, and other features, like parameter validation.
 *
 * It implements a superset of the command object pattern.
 * @see https://en.wikipedia.org/wiki/Command_pattern
 *
 * @abstract
 * @example
 *
 * class RemoveTodo extends BusinessAction {
 *   validationConstraints = {
 *     todoId: { presence: true }
 *   }
 *
 *   isAllowed {
 *     return !!this.performer.admin
 *   }
 *
 *   async executePerform() {
 *     const { todoId } = this.params
 *     await ToDo.destroyByPk(todoId)
 *   }
 * }
 *
 * new RemoveTodo().perform()
 * new RemoveTodo({ todoId: 2 }, currentUser).perform()
 */
class BusinessAction {
  /**
   * A plain map of parameters for your business action to work with.
   * @see https://github.com/ansman/validate.js
   * @type {object}
   * @private
   */
  params = {}

  /**
   * A plain map of deafults for your business action's parameters.
   * This and params will be deep merged.
   * @see https://github.com/ansman/validate.js
   * @type {object}
   * @abstract
   * @private
   */
  defaultParams = {}

  /**
   * Override to define validation options.
   * @see https://github.com/ansman/validate.js
   * @type {object}
   * @abstract
   * @private
   */
  validationConstraints = {}

  /**
   * Whether this action is valid. It is set after call to this.validate(), so don't query directly.
   * @see https://github.com/ansman/validate.js
   * @type {boolean}
   * @private
   */
  valid = true

  /**
   * Errors list as plain object, where each key is a param, and values is a list of errors for that param.
   * A.k.a.: errors per field.
   * @see https://github.com/ansman/validate.js
   * @type {object}
   * @private
   */
  errors = []

  /**
   * @deprecated
   * @type {boolean}
   * @abstract
   * @private
   */
  runWithinTransaction = true

  /**
   * The transaction used to wrap our db queries.
   * If passed, ths business action will not take of managing (commit, rollback) this transaction.
   * @type {transaction}
   * @private
   */
  transaction = undefined

  /**
   * The transaction isolation level to use.
   * @type {Sequelize isolation level}
   * @see https://sequelize.org/master/class/lib/transaction.js~Transaction.html#static-get-ISOLATION_LEVELS
   * @abstract
   * @private
   */
  transactionLevel = undefined

  /**
   * Not intended to be overidable. We should not manage (commit, rollback) a transaction that we did not create.
   * @type {boolean}
   * @abstract
   * @private
   */
  manageTransaction = true

  /**
   * Whether this action requires a performer.
   * Unless set to `false`, instantiating this action without a performer will raise `BusinessActionInitializationError`.
   * @type {boolean}
   * @abstract
   * @private
   */
  static requirePerformer = true

  /**
   * @constructor
   * @param {object} params Parameters that your business accepts
   * @param {object} performer The user responsible for this action
   * @param {object} options Options
   * @param {https://sequelize.org/master/manual/transactions.html} options.transaction A transaction to wrap our DB queries with
   * @throws {BusinessActionInitializationError}
   */
  constructor (params = {}, performer, { transaction } = {}) {
    if (this.constructor.requirePerformer && !performer) {
      throw new BusinessActionInitializationError(this, 'Missing performer')
    }

    this.params = merge({}, this.defaultParams, params)
    this.performer = performer

    // If transaction is passed, we must let the caller manage it
    if (transaction) {
      this.transaction = transaction
      this.manageTransaction = false
    }
  }

  /**
   * The interface for our business action.
   * @throws {BusinessActionValidationError}
   * @throws {BusinessActionForbiddenError}
   */
  async perform () {
    const valid = await this.validate()
    if (!valid) throw new BusinessActionValidationError(this)

    const isAllowed = await this.isAllowed()
    if (!isAllowed) throw new BusinessActionForbiddenError(this)

    const result = await this.aroundPerform(this.executePerform.bind(this))

    // Errors could have been added during perform
    if (this.hasErrors()) throw new BusinessActionValidationError(this)

    return result
  }

  /**
   * You must override this method to define your business action implementation.
   * Consider it private.
   * @throws {NotImplementedError}
   * @abstract
   */
  async executePerform () {
    const message = `You must define method "executePerform" for business action "${this.constructor.name}"`
    throw new NotImplementedError(message)
  }

  /**
   * @abstract
   * @return {boolean}
   * @example
   *
   * async isAllowed() {
   *   return await this.performer.getPermissions()
   * }
   */
  async isAllowed () {
    return true
  }

  /**
   * Overridable. You can extend it to define custom behavior to be executed around perform.
   * Probably more usable as a mixin to add same behavior to some subset of business actions.
   * Consider it private.
   *
   * @abstract
   * @private
   * @param {function} The function you are wrapping/overriding
   *
   * @example
   *
   * async aroundPerform(executePerform) {
   *   doSomething()
   *   await executePerform()
   *   doSomethingElse()
   * }
   */
  async aroundPerform (executePerform) {
    if (!this.runWithinTransaction) {
      return await executePerform()
    }

    const options = this.transactionIsolationLevel && {
      isolationLevel: this.transactionIsolationLevel
    }

    this.transaction =
      this.transaction || (await sequelize.transaction(options))

    try {
      const result = await executePerform()
      this.manageTransaction && (await this.transaction.commit())
      return result
    } catch (error) {
      this.manageTransaction && (await this.transaction.rollback())
      throw error
    }
  }

  /**
   * @private
   * TODO: Make a validate.js Adapter/Facade/Wrapper that provides a nicer use interface
   */
  async validate () {
    try {
      const constraints =
        typeof this.validationConstraints === 'function'
          ? this.validationConstraints(this)
          : this.validationConstraints

      await validate.async(this.params, constraints)
    } catch (errors) {
      // The returned errors should be a plain object.
      // Otherwise it must be an error that was thrown while performing the validations
      // Validate.js interface is not very good...
      if (isPlainObject(errors)) {
        this.addErrorsPerField(null, errors)
      } else {
        throw errors
      }
    }

    this.valid = !this.hasErrors()

    return this.valid
  }

  /**
   * @private
   * TODO: hide implmentation details for error handling in another class
   */
  hasErrors () {
    return !!Object.entries(this.errors).find(
      ([field, errors]) => errors.length > 0
    )
  }

  /**
   * @private
   */
  addError (path, error) {
    if (!error) return
    update(this.errors, path, (errors = []) => [...errors, error])
  }

  /**
   * @private
   */
  addErrors (path, errors) {
    if (!errors || errors.length === 0) return
    errors.forEach(e => this.addError(path, e))
  }

  /**
   * @private
   */
  addErrorsPerField (path, errorsPerField) {
    Object.entries(errorsPerField).forEach(([field, errorMessages]) => {
      const finalPath = [path, field]
        .filter(s => s !== '' && s !== undefined && s !== null)
        .join('.')

      this.addErrors(finalPath, errorMessages)
    })
  }
}

export { BusinessActionValidationError, BusinessActionForbiddenError }
export default BusinessAction
