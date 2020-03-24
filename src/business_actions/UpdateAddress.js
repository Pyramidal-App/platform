import BusinessAction from '../BusinessAction'
import { Address } from '../models'

class UpdateAddress extends BusinessAction {
  validationConstraints = {
    id: { presence: true }
  }

  async executePerform() {
    const { id, ...attrs } = this.params
    const address = await Address.findByPk(id)
    await address.update(attrs)
    return address
  }
}

export default UpdateAddress
