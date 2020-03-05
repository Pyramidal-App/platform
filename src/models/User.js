import Model, { Sequelize } from '../Model'

class User extends Model {
  avatarUrl() {
    return this.googleAvatarUrl
  }
}

User.init({
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  googleAvatarUrl: Sequelize.STRING
})

export default User
