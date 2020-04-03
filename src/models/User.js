import Model, { Sequelize } from '../Model'

class User extends Model {
  // When we implement more OAuth providers,
  // we'll have multiple avatar sources too.
  avatarUrl () {
    return this.googleAvatarUrl
  }
}

User.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  googleAvatarUrl: Sequelize.STRING
})

export default User
