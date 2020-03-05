import { Sequelize, sequelize } from './db'

class Model extends Sequelize.Model {
  static init(config, options) {
    super.init(config, { sequelize, ...options })
  }
}

export { Sequelize }
export default Model
