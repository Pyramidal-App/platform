import BusinessAction from '../BusinessAction.js'
import { Customer } from '../models'

class UpdateCustomer extends BusinessAction {
  validationConstraints = {
    id: { presence: true },
    name: { presence: true }
  }

  async isAllowed() {
    const customer = this.customer()
    return customer.UserId = this.performer.id
  }

  async executePerform() {
    const { name } = this.params
    const customer = await this._customer()
    return await customer.update({ name })
  }

  async _customer() {
    if (!this.__customer) {
      this.__customer = await Customer.findByPk(this.params.id)
    }
    return this.__customer
  }
}

export default UpdateCustomer
