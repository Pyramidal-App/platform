'use strict'

const createEnum = require('../helpers/createEnum')
const dropType = require('../helpers/dropType')

const ENUM_NAME = 'call_outcome'
const ENUM_VALUES = ['DIDNT_ANSWER', 'NOT_INTERESTED', 'SUCCESS', 'DONT_CALL']

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await createEnum(queryInterface, ENUM_NAME, ENUM_VALUES)

    await queryInterface.createTable('Calls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      outcome: {
        type: ENUM_NAME,
        allowNull: false
      },
      dateTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      PhoneNumberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'PhoneNumbers', key: 'id' }
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Customers', key: 'id' }
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Calls')
    await dropType(queryInterface, ENUM_NAME)
  }
}
