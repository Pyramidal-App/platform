import { User, Customer, Interaction, PhoneNumber } from '$src/models'

const OUTCOMES = {
  DIDNT_ANSWER: 'No contestó',
  NOT_INTERESTED: 'No le interesa',
  SUCCESS: 'Éxito',
  DONT_CALL: 'No llamar'
}

const CallResolver = {
  user: async call => await User.findByPk(call.UserId),
  customer: async call => await Customer.findByPk(call.CustomerId),
  notes: async call => await new Interaction({ id: call.id }).getNotes(),
  phoneNumber: async call => await PhoneNumber.findByPk(call.PhoneNumberId),
  displayOutcome: call => OUTCOMES[call.outcome]
}

export default CallResolver
