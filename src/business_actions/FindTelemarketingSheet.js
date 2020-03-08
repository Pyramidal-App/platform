import BusinessAction from '../BusinessAction'
import { TelemarketingSheet } from '../models'

class FindTelemarketingSheet extends BusinessAction {
  validationConstraints = { firstNumbers: { presence: true }}

  async isAllowed() {
    const sheet = await this._sheet()

    if (sheet === undefined) {
      return true
    } else {
      return sheet.UserId === this.performer.id
    }
  }

  async executePerform() {
    return await this._sheet()
  }

  // "Private"
  async _sheet() {
    if (!this.__sheet) {
      const { firstNumbers } = this.params
      const UserId = this.performer.id

      this.__sheet = await TelemarketingSheet.findOne({ where: { firstNumbers }})
    }

    return this.__sheet
  }
}

export default FindTelemarketingSheet
