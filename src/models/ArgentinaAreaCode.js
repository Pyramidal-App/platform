import Model, { Sequelize } from '$src/Model'

class ArgentinaAreaCode extends Model {}

ArgentinaAreaCode.init({
  areaCode: Sequelize.STRING,
  province: Sequelize.STRING,
  localities: Sequelize.ARRAY(Sequelize.STRING)
})

export default ArgentinaAreaCode
