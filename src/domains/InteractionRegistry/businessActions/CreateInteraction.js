import BusinessAction from '$src/BusinessAction'
import { Interaction, Note, PhoneNumber } from '$src/models'

const OUTCOMES = [
  'DIDNT_ANSWER',
  'NOT_INTERESTED',
  'SUCCESS',
  'DONT_CALL'
]

class CreateInteraction extends BusinessAction {
  validationConstraints = {
    phoneNumberId: { presence: true },
    outcome: { presence: true, inclusion: OUTCOMES },
    dateTime: { presence: true }
  }

  async executePerform() {
    const { phoneNumberId, customerId, outcome, notes, dateTime } = this.params
    const transaction = this.transaction

    const call = await Interaction.create({
      outcome,
      dateTime,
      PhoneNumberId: phoneNumberId,
      CustomerId: customerId,
      UserId: this.performer.id,
    }, { transaction })

    if (outcome === 'DONT_CALL') {
      const phoneNumber = await PhoneNumber.findByPk(phoneNumberId, { transaction })
      phoneNumber && await phoneNumber.update({ dontCall: true }, { transaction })
    }

    // Associate with as many entities as possible,
    // so we can later display notes related to each entity by separate.
    notes && await Note.create({
      UserId: this.performer.id,
      CustomerId: customerId,
      CallId: call.id,
      PhoneNumberId: phoneNumberId,
      body: notes
    }, { transaction })

    return call
  }
}

export default CreateInteraction
