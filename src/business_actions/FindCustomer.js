import BusinessAction from '../BusinessAction'
import { Customer, PhoneNumber, Address } from '../models'

class FindCustomer extends BusinessAction {
  validationConstraints = {
    countryCode: { presence: true },
    areaCode: { presence: true },
    number: { presence: true }
  }

  async executePerform () {
    const { countryCode, areaCode, number } = this.params

    return await Customer.findOne({
      include: [
        {
          model: PhoneNumber,
          required: true,
          where: { countryCode: '54', areaCode: '11', number: '12312305' }
        },
        { model: PhoneNumber }
      ]
    })
  }
}

export default FindCustomer
