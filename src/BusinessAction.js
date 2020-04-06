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
  // These are options that sub-classes can use
  validationConstraints = {}
  runWithinTransaction = true
  transactionLevel = undefined
  manageTransaction = true

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

  // You can overwrite these
  executePerform () {
    const message = `You must define method "executePerform" from business action "${this.constructor.name}"`
    throw new BusinessActionDefinitionError(this, message)
  }

  async isAllowed () {
    return true
  }

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
