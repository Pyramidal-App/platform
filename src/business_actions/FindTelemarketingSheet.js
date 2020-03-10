import BusinessAction from '../BusinessAction'
import { TelemarketingSheet } from '../models'

class FindTelemarketingSheet extends BusinessAction {
  validationConstraints = {
    countryCode: { presence: true },
    areaCode: { presence: true },
    firstNumbers: { presence: true }
  }

  async executePerform() {
    const { countryCode, areaCode, firstNumbers } = this.params
    const UserId = this.performer.id
    return await TelemarketingSheet.findOne({ where: { UserId, countryCode, areaCode, firstNumbers }})
  }
}

export default FindTelemarketingSheet
