import BusinessAction from '../BusinessAction'
import { Call, Note, PhoneNumber } from '../models'

const OUTCOMES = [
  'DIDNT_ANSWER',
  'NOT_INTERESTED',
  'SUCCESS',
  'DONT_CALL'
]

class CreateCall extends BusinessAction {
  runPerformWithinTransaction = true

  validationConstraints = {
    phoneNumberId: { presence: true },
    customerId: { presence: true },
    notes: { presence: true },
    outcome: { presence: true, inclusion: OUTCOMES },
    dateTime: { presence: true }
  }

  async executePerform() {
    const { phoneNumberId, customerId, outcome, notes, dateTime } = this.params

    const call = await Call.create({
      outcome,
      dateTime,
      PhoneNumberId: phoneNumberId,
      CustomerId: customerId,
      UserId: this.performer.id,
    })

    if (outcome === 'DONT_CALL') {
      const phoneNumber = await PhoneNumber.findByPk(phoneNumberId)
      phoneNumber && await phoneNumber.update({ dontCall: true })
    }

    // Associate with as many entities as possible,
    // so we can later display notes related to each entity by separate.
    await Note.create({
      UserId: this.performer.id,
      CustomerId: customerId,
      CallId: call.id,
      PhoneNumberId: phoneNumberId,
      body: notes
    })

    return call
  }
}

export default CreateCall
