'use strict'

const UNIQUE_ATTRIBUTES = ['UserId', 'countryCode', 'areaCode', 'firstNumbers']
const CONSTRAINT_NAME = 'unique_telemarketing_sheets'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addConstraint('TelemarketingSheets', UNIQUE_ATTRIBUTES, {
      type: 'unique',
      name: CONSTRAINT_NAME
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeConstraint('TelemarketingSheets', CONSTRAINT_NAME)
}
