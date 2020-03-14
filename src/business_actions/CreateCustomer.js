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
  runPerformWithinTransaction = true

  get validationConstraints () {
    return {
      name: { presence: true },

      ...allOrNone(this.params, [
        'phoneNumberCountryCode',
        'phoneNumberAreaCode',
        'phoneNumber'
      ]),

      ...allOrNone(this.params, [
        'addressGooglePlaceId',
        'addressLabel',
        'addressNotes',
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

    const customer = await Customer.create({
      UserId: this.performer.id,
      name
    })

    const [dbPhoneNumber] = await PhoneNumber.findOrCreate({
      where: {
        countryCode: phoneNumberCountryCode,
        areaCode: phoneNumberAreaCode,
        number: phoneNumber
      }
    })

    await CustomersPhoneNumber.findOrCreate({
      where: {
        CustomerId: customer.id,
        PhoneNumberId: dbPhoneNumber.id
      }
    })

    const address = await Address.create({
      CustomerId: customer.id,
      googlePlaceId: addressGooglePlaceId,
      label: addressLabel,
      notes: addressNotes,
      lat: addressLat,
      lng: addressLng
    })

    return {
      ...customer.dataValues,
      addresses: [address.dataValues],
      phoneNumbers: [dbPhoneNumber.dataValues]
    }
  }
}

export default CreateCustomer
