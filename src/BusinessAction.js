import update from 'lodash.update'

import validate from './validate'
import { sequelize } from './db'

const isPlainObject = obj =>
  Object.prototype.toString.call(obj) === '[object Object]'

class BusinesActionValidationError extends Error {
  constructor (ba, errors) {
    super('Business action validation error')
    this.businessAction = ba
    this.errors = ba.errors
  }
}

class BusinesActionForbiddenError extends Error {
  constructor (ba) {
    super('Business action is forbidden for this performer')
    this.businessAction = ba
  }
}

class BusinessActionDefinitionError extends Error {
  constructor (ba, message) {
    super(message)
    this.name = 'BusinessActionDefinitionError'
    this.businessAction = ba
  }
}

// Abstract class that implements command object pattern.
// These should be the building block for business logic.
// Organize BAs inside domains.
class BusinessAction {
  /**
  * A plain map of attributes for your business action to work with.
  * @see https://github.com/ansman/validate.js
  */
  params = {}

  /**
  * Override to define validation options.
  * @see https://github.com/ansman/validate.js
  */
  validationConstraints = {}

  /**
  * TODO: Deprecated.
  */
  runWithinTransaction = true

  /**
  * The transaction used to wrap our db queries.
  * If passed, ths business action will not take of managing (commit, rollback) this transaction.
  */
  transaction

  /**
  * The transaction isolation level to use.
  * @see https://sequelize.org/master/class/lib/transaction.js~Transaction.html#static-get-ISOLATION_LEVELS
  */
  transactionLevel = undefined

  /**
  * Not intended to be overidable. We should not manage (commit, rollback) a transaction that we did not create.
  */
  manageTransaction = true

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
  * @constructor
  * @param {object} params Parameters that your business accepts
  * @param {object} performer The user responsible for this action
  * @param {object} transaction A transaction to wrap our DB queries with
  *
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
  constructor (params, performer, { transaction } = {}) {
    this.params = params || {}
    this.performer = performer

    this.errors = {}
    this.valid = true

    // If transaction is passed, we must let the caller manage it
    if (transaction) {
      this.transaction = transaction
      this.manageTransaction = false
    }
  }

  /**
  * The interface for our business action.
  * @throws {BusinesActionValidationError}
  * @throws {BusinesActionForbiddenError}
  */
  async perform () {
    const valid = await this.validate()
    if (!valid) throw new BusinesActionValidationError(this)

    const isAllowed = await this.isAllowed()
    if (!isAllowed) throw new BusinesActionForbiddenError(this)

    const result = await this.aroundPerform(this.executePerform.bind(this))

    // Errors could have been added during perform
    if (this.hasErrors()) throw new BusinesActionValidationError(this)

    return result
  }

  /**
  * You must override this method to define your business action implementation.
  * Consider it private.
  * @throws {BusinesActionForbiddenError}
  */
  async executePerform () {
    const message = `You must define method "executePerform" from business action "${this.constructor.name}"`
    throw new BusinessActionDefinitionError(this, message)
  }

  /**
  * Overridable
  *
  * @return {boolean}
  *
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
  * @param executePerform The function you are wrapping/overriding
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

    const options = this.transactionIsolationLevel && { isolationLevel: this.transactionIsolationLevel }

    this.transaction = this.transaction || await sequelize.transaction(options)

    try {
      const result = await executePerform()
      this.manageTransaction && await this.transaction.commit()
      return result
    } catch (error) {
      this.manageTransaction && await this.transaction.rollback()
      throw error
    }
  }

  // TODO: Make a validate.js Adapter/Facade/Wrapper that provides a nicer use interface
  async validate () {
    try {
      const constraints =
        typeof this.validationConstraints === 'function' ?
        this.validationConstraints(this) :
        this.validationConstraints

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

  // TODO: hide implmentation details for error handling in another class
  hasErrors () {
    return !!Object.entries(this.errors).find(
      ([field, errors]) => errors.length > 0
    )
  }

  addError (path, error) {
    if (!error) return
    update(this.errors, path, (errors = []) => [...errors, error])
  }

  addErrors (path, errors) {
    if (!errors || errors.length === 0) return
    errors.forEach(e => this.addError(path, e))
  }

  addErrorsPerField (path, errorsPerField) {
    Object.entries(errorsPerField).forEach(([field, errorMessages]) => {
      const finalPath = [path, field]
        .filter(s => s !== '' && s !== undefined && s !== null)
        .join('.')

      this.addErrors(finalPath, errorMessages)
    })
  }
}

export { BusinesActionValidationError, BusinesActionForbiddenError }
export default BusinessAction
