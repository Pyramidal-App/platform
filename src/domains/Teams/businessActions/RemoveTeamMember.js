import TeamsBusinessAction from '../TeamsBusinessAction'
import { TeamMembership } from '$src/models'

class RemoveTeamMember extends TeamsBusinessAction {
  async executePerform () {
    const { teamId, teamMembershipId } = this.params

    await TeamMembership.destroy({
      where: {
        TeamId: teamId,
        id: teamMembershipId
      },
      transaction: this.transaction
    })
  }
}

export default RemoveTeamMember
