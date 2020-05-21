import TeamsBusinessAction from '../TeamsBusinessAction'
import { TeamMembership, User } from '$src/models'

class InviteToTeam extends TeamsBusinessAction {
  get validationConstraints() {
    return {
      ...super.validationConstraints,
      email: {
        presence: { allowEmpty: false },
        unique: {
          getRecordCount: async email =>
            await TeamMembership.count({
              where: { TeamId: this.params.teamId },
              include: [{ model: User, required: true, where: { email } }]
            }),
          message: '^Este usuario ya pertenece a este equipo'
        }
      }
    }
  }

  async executePerform () {
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
