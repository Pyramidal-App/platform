import BussinessAction from '../BusinessAction'
import { TelemarketingSheet } from '../models'

class FindOrCreateTelemarketingSheet extends BussinessAction {
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
    const attributes = { countryCode, areaCode, firstNumbers, UserId }

    const existingSheet = await TelemarketingSheet.findOne({ where: attributes })

    if (existingSheet) {
      return existingSheet
    } else {
      return await TelemarketingSheet.create(attributes)
    }
  }
}

export default FindOrCreateTelemarketingSheet
