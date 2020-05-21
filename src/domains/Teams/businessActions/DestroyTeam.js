import TeamsBusinessAction from '../TeamsBusinessAction'
import { Team, TeamMembership } from '$src/models'

class DestroyTeam extends TeamsBusinessAction {
  async executePerform () {
    const { teamId } = this.params

    await TeamMembership.destroy({
      where: { TeamId: teamId },
      transaction: this.transaction
    })

    await Team.destroy({
      where: { id: teamId },
      transaction: this.transaction
    })
  }
}

export default DestroyTeam
