import BussinessAction from '../BusinessAction'
import { TelemarketingSheet } from '../models'

class CreateTelemarketingSheet extends BussinessAction {
  runPerformWithinTransaction = true

  validationConstraints = {
    countryCode: {
      presence: true,
      length: { maximum: 3 }
    },

    areaCode: {
      presence: true,
      length: { minimum: 2, maximum: 4 }
    },

    firstNumbers: {
      presence: true,
      length: { is: 6 }
    }
  }

  async executePerform() {
    const { countryCode, areaCode, firstNumbers } = this.params
    const UserId = this.performer.id

    return await TelemarketingSheet.create({ countryCode, areaCode, firstNumbers, UserId })
  }
}

export default CreateTelemarketingSheet
