import BusinessAction from '$src/BusinessAction'
import { Customer, CustomersPhoneNumber, PhoneNumber, Address } from '$src/models'

// If any of these attributes is pressent, all of them must be
const allOrNone = (params, attributes) => {
  if (attributes.find(attr => params[attr])) {
    return attributes.reduce(
      (acc, attr) => ({ ...acc, [attr]: { presence: true } }),
      {}
    )
  }
}

// Creates a customer belonging to performer
class CreateCustomer extends BusinessAction {
  get validationConstraints () {
    return {
      name: { presence: { allowEmpty: false } },

      ...allOrNone(this.params, [
        'addressGooglePlaceId',
        'addressLabel',
        'addressLat',
        'addressLng'
      ])
    }
  }

  async executePerform () {
    const {
      name,
      phoneNumbers,
      addressGooglePlaceId,
      addressLabel,
      addressNotes,
      addressLat,
      addressLng
    } = this.params

    const transaction = this.transaction

    const customer = await Customer.create({ UserId: this.performer.id, name }, { transaction })

    for (const pnData of phoneNumbers) {
      await this._associatePhoneNumber(customer.id, pnData)
    }

    const address = await Address.create({
      CustomerId: customer.id,
      googlePlaceId: addressGooglePlaceId,
      label: addressLabel,
      notes: addressNotes,
      lat: addressLat,
      lng: addressLng
    }, { transaction })

    return customer
  }

  async _associatePhoneNumber(customerId, { countryCode, areaCode, number, delete: DELETED }) {
    if (DELETED) { return }

    const [dbPhoneNumber] = await PhoneNumber.findOrCreate({
      where: { countryCode, areaCode, number },
      transaction: this.transaction
    })

    await CustomersPhoneNumber.findOrCreate({
      where: {
        CustomerId: customerId,
        PhoneNumberId: dbPhoneNumber.id
      },
      transaction: this.transaction
    })
  }
}

export default CreateCustomer
