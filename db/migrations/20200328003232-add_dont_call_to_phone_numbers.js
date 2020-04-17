'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('PhoneNumbers', 'dontCall', Sequelize.BOOLEAN),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('PhoneNumbers', 'dontCall')
}
