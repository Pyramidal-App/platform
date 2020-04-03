import Model, { Sequelize } from '../Model'

class Team extends Model {}

Team.init({
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

export default Team
