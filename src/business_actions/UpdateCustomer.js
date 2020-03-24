import BusinessAction from '../BusinessAction.js'
import { Customer } from '../models'

class UpdateCustomer extends BusinessAction {
  validationConstraints = {
    id: { presence: true },
    name: { presence: true }
  }

  async executePerform() {
    const { id, name } = this.params
    const customer = await Customer.findByPk(id)
    return await customer.update({ name })
  }
}

export default UpdateCustomer
