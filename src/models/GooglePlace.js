import Model, { Sequelize } from '../Model'

class GooglePlace extends Model {}

GooglePlace.init({
  PhoneNumberId: Sequelize.INTEGER,

  googlePlaceId: {
    type: Sequelize.STRING,
    allowNull: false
  },

  lat: {
    type: Sequelize.FLOAT,
    allowNull: false
  },

  lng: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
})

export default GooglePlace
