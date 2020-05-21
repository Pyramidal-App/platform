import TeamsBusinessAction from '../TeamsBusinessAction'
import { TeamMembership } from '$src/models'

class LeaveTeam extends TeamsBusinessAction {
  // An admin cannot leave the team,
  // because it would be left an orphan.
  async isAllowed () {
    return !(await this.performerIsTeamAdmin())
  }

  async executePerform () {
    const { teamId } = this.params

    await TeamMembership.destroy({
      where: {
        UserId: this.performer.id,
        TeamId: teamId
      },
      transaction:this.transaction
    })
  }
}

export default LeaveTeam
