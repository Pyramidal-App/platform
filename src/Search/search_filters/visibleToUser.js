import { User } from '$src/models'
import { where } from '../Search'

// Generates query options to filter a model that belongs to an user,
// where the owner user is the given user, or one of their teammates.
const visibleToUser = async (queryOptions, userId) => {
  if (!userId) { return queryOptions }

  const user = await User.findByPk(userId)
  const [team] = await user.getTeams()
  const teamMembers = team && await team.getMembers()
  const teamMemberIds = team && teamMembers.map(tm => tm.id)

  return where(queryOptions, { UserId: [userId, ...teamMemberIds] })
}

export default visibleToUser
