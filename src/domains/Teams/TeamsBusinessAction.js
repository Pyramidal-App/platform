import BusinessAction from '$src/BusinessAction'
import { TeamMembership } from '$src/models'

class TeamsBusinessAction extends BusinessAction {
  validationConstraints = {
    teamId: { presence: { allowEmpty: false } }
  }

  async isAllowed () {
    return await this.performerIsTeamAdmin()
  }

  async performerIsTeamAdmin() {
    const membership = await TeamMembership.findOne({
      where: {
        UserId: this.performer.id,
        TeamId: this.params.teamId
      }
    })

    return membership.admin
  }
}

export default TeamsBusinessAction
