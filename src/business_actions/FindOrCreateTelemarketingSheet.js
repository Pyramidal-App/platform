import BussinessAction from '../BusinessAction'
import { TelemarketingSheet } from '../models'

class FindOrCreateTelemarketingSheet extends BussinessAction {
  validationConstraints = {
    countryCode: {
      presence: true,
      length: { maximum: 3 }
    },

    areaCode: {
      presence: true,
      length: { minimum: 2, maximum: 4 }
    },

    firstNumbers: { presence: true }
  }

  async executePerform () {
    const { countryCode, areaCode, firstNumbers } = this.params
    const UserId = this.performer.id

    const [sheet] = await TelemarketingSheet.findOrCreate({
      where: { countryCode, areaCode, firstNumbers, UserId },
      transaction: this.transaction
    })

    return sheet
  }
}

export default FindOrCreateTelemarketingSheet
