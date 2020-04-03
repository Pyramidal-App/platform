import Model, { Sequelize } from '../Model'

class TeamMembership extends Model {}

TeamMembership.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  TeamId:  {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  UserId:  {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  admin: Sequelize.BOOLEAN
})

export default TeamMembership
