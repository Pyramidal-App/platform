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

    const customer = await Customer.findOne({
      include: [
        {
          model: PhoneNumber,
          required: true,
          where: { countryCode, areaCode, number }
        },
        { model: Address }
      ]
    })

    // TODO: implement a proper field resolver
    return customer && {
      ...customer.dataValues,
      id: customer.id,
      addresses: customer.Addresses,
      phoneNumbers: customer.PhoneNumbers
    }
  }
}

export default FindCustomer
