'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Tasks', 'TriggererCallId', {
      type: Sequelize.INTEGER,
      allowNull: true
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Tasks', 'TriggererCallId', {
      type: Sequelize.INTEGER,
      allowNull: false
    })
}
