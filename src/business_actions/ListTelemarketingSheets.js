import BusinesAction from '../BusinessAction'
import { TelemarketingSheet } from '../models'

class ListTelemarketingSheets extends BusinesAction {
  async executePerform () {
    return await TelemarketingSheet.findAll({
      where: { UserId: this.performer.id }
    })
  }
}

export default ListTelemarketingSheets
