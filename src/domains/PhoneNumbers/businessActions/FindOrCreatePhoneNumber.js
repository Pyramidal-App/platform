import BusinessAction from '$src/BusinessAction'
import { PhoneNumber } from '$src/models'

class FindOrCreatePhoneNumber extends BusinessAction {
  validationConstraints = {
    countryCode: {
      presence: true,
      length: { maximum: 4 }
    },
    areaCode: {
      presence: true,
      length: { minimum: 2, maximum: 4}
    },
    number: {
      presence: true,
      length: { minimum: 6, maximum: 8}
    }
  }

  async executePerform() {
    const { countryCode, areaCode, number } = this.params

    const [phoneNumber] = await PhoneNumber.findOrCreate({
      where: { countryCode, areaCode, number },
      transaction: this.transaction
    })

    return phoneNumber
  }
}

export default FindOrCreatePhoneNumber
