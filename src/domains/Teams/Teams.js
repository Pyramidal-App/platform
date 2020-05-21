import CreateTeam from './businessActions/CreateTeam'
import DestroyTeam from './businessActions/DestroyTeam'
import InviteToTeam from './businessActions/InviteToTeam'
import LeaveTeam from './businessActions/LeaveTeam'

const Teams = {
  create: CreateTeam,
  destroy: DestroyTeam,
  invite: InviteToTeam,
  leave: LeaveTeam
}

export default Teams
