import Model, { Sequelize } from '../Model'

class TelemarketingSheet extends Model {}

TelemarketingSheet.init({
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  countryCode: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  areaCode: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  firstNumbers: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
})

export default TelemarketingSheet
