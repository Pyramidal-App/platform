import BusinesAction from '../BusinessAction'
import { User } from '../models'

class UpdateCurrentUser extends BusinesAction {
  validationConstraints = {
    name: {
      presence: { allowEmpty: false }
    }
  }

  async executePerform() {
    return await this.performer.update({ name: this.params.name })
  }
}

export default UpdateCurrentUser
