import BusinessAction from '$src/BusinessAction'
import { Note } from '$src/models'

class CreateNote extends BusinessAction {
  validationConstraints = {
    contactId: { presence: { allowEmpty: false } },
    body: { presence: { allowEmpty: false } }
  }

  async executePerform() {
    const { contactId, body } = this.params
    const transaction = this.transaction
    return await Note.create({
      UserId: this.performer.id,
      CustomerId: contactId,
      body
    }, { transaction })
  }
}

export default CreateNote
