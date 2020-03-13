import Model, { Sequelize } from '../Model'

class Address extends Model {}

Address.init({
  CustomerId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  lat: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lng: {
    type: Sequelize.STRING,
    allowNull: false
  },
  googlePlaceId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  label: {
    type: Sequelize.STRING,
    allowNull: false
  },
  notes: {
    type: Sequelize.STRING
  }
})

export default Address
