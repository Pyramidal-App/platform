import BusinessAction from '../BusinessAction'
import { Customer, PhoneNumber, Address } from '../models'

class FindCustomers extends BusinessAction {
  validationConstraints = {
    countryCode: { presence: true },
    areaCode: { presence: true },
    number: { presence: true }
  }

  async executePerform () {
    const { countryCode, areaCode, number } = this.params

    const [team] = await this.performer.getTeams()
    const teamMembers = await team.getMembers()
    const teamMemberIds = teamMembers.map(tm => tm.id)

    const customers = await Customer.findAll({
      where:  { UserId: [this.performer.id, ...teamMemberIds] },
      include: [
        {
          model: PhoneNumber,
          required: true,
          where: { countryCode, areaCode, number }
        },
        { model: Address }
      ]
    })

    return customers
  }
}

export default FindCustomers
