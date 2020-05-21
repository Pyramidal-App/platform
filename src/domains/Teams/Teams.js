import CreateTeam from './businessActions/CreateTeam'
import DestroyTeam from './businessActions/DestroyTeam'
import InviteToTeam from './businessActions/InviteToTeam'
import LeaveTeam from './businessActions/LeaveTeam'
import RemoveTeamMember from './businessActions/RemoveTeamMember'

const Teams = {
  create: CreateTeam,
  destroy: DestroyTeam,
  invite: InviteToTeam,
  leave: LeaveTeam,
  removeMember: RemoveTeamMember
}

export default Teams
