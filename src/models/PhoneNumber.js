import Model, { Sequelize } from '../Model'

class PhoneNumber extends Model {}

PhoneNumber.init({
  countryCode: {
    type: Sequelize.STRING,
    allowNull: false
  },
  areaCode: {
    type: Sequelize.STRING,
    allowNull: false
  },
  number: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dontCall: Sequelize.BOOLEAN
})

export default PhoneNumber
