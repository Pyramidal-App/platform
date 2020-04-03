import BusinessAction from '../BusinessAction'
import { TeamMembership, User } from '../models'

class InviteToTeam extends BusinessAction {
  validationConstraints = ({ params: { email } }) => ({
    teamId: { presence: { allowEmpty: false } },
    email: {
      presence: { allowEmpty: false },
      unique: {
        getRecordCount: async email => {
          console.log('QWER')

          return await TeamMembership.count({
            where: { TeamId: this.params.teamId },
            include: [{ model: User, required: true, where: { email } }]
          })
        },
        message: '^Este usuario ya pertenece a este equipo'
      }
    }
  })

  async isAllowed () {
    const membership = await TeamMembership.findOne({
      where: {
        UserId: this.performer.id,
        TeamId: this.params.teamId
      }
    })

    return membership.admin
  }

  async executePerform () {
    console.log('ASDF')

    const { teamId, email } = this.params
    const transaction = this.transaction

    const [newMember] = await User.findOrCreate({
      where: { email },
      transaction
    })

    const membership = await TeamMembership.create(
      {
        UserId: newMember.id,
        TeamId: teamId
      },
      { transaction }
    )

    return membership
  }
}

export default InviteToTeam
