import BusinessAction from '../BusinessAction'
import { Customer, CustomersPhoneNumber, PhoneNumber, Address } from '../models'

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
        'phoneNumberCountryCode',
        'phoneNumberAreaCode',
        'phoneNumber'
      ]),

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
      phoneNumberCountryCode,
      phoneNumberAreaCode,
      phoneNumber,
      addressGooglePlaceId,
      addressLabel,
      addressNotes,
      addressLat,
      addressLng
    } = this.params

    const transaction = this.transaction

    const customer = await Customer.create({ UserId: this.performer.id, name }, { transaction })

    const [dbPhoneNumber] = await PhoneNumber.findOrCreate({
      where: {
        countryCode: phoneNumberCountryCode,
        areaCode: phoneNumberAreaCode,
        number: phoneNumber
      },
      transaction
    })

    await CustomersPhoneNumber.findOrCreate({
      where: {
        CustomerId: customer.id,
        PhoneNumberId: dbPhoneNumber.id
      },
      transaction
    })

    const address = await Address.create({
      CustomerId: customer.id,
      googlePlaceId: addressGooglePlaceId,
      label: addressLabel,
      notes: addressNotes,
      lat: addressLat,
      lng: addressLng
    }, { transaction })

    return {
      ...customer.dataValues,
      addresses: [address.dataValues],
      phoneNumbers: [dbPhoneNumber.dataValues]
    }
  }
}

export default CreateCustomer
