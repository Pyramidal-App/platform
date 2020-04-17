'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    })
}
