import BusinessAction from '../BusinessAction'
import { Task } from '../models'

class UpdateTask extends BusinessAction {
  validationConstraints =  {
    id: { presence: { allowEmpty: false } }
  }

  async isAllowed() {
    const task = await this._getTask()
    return task.UserId === this.performer.id
  }

  async executePerform() {
    const { status } = this.params
    const task = await this._getTask()
    return await this.task.update({ status })
  }

  // "Private"
  async _getTask() {
    if (!this.task) { this.task = await Task.findByPk(this.params.id) }
    return this.task
  }
}

export default UpdateTask
