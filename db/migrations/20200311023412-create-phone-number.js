'use strict'

const TABLE_NAME = 'PhoneNumbers'
const UNIQUE_ATTRIBUTES = ['countryCode', 'areaCode', 'number']
const CONSTRAINT_NAME = 'unique_phone_numbers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_NAME, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
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
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.addConstraint(TABLE_NAME, UNIQUE_ATTRIBUTES, {
      type: 'unique',
      name: CONSTRAINT_NAME
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME)
    await queryInterface.dropTable(TABLE_NAME)
  }
}
