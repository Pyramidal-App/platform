'use strict'

const createEnum = require('../helpers/createEnum')
const dropType = require('../helpers/dropType')

const TYPE_ENUM = 'task_type'
const STATUS_ENUM = 'task_status'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await createEnum(queryInterface, TYPE_ENUM, ['CALL', 'VISIT'])
    await createEnum(queryInterface, STATUS_ENUM, [
      'PENDING',
      'COMPLETED',
      'CANCELLED'
    ])

    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      taskType: {
        type: TYPE_ENUM,
        allowNull: false
      },
      dueDate: {
        type: Sequelize.DATE
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Customers', key: 'id' }
      },
      TriggererCallId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Calls', key: 'id' }
      },
      status: {
        type: STATUS_ENUM,
        allowNull: false
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
    await queryInterface.dropTable('Tasks')
    await dropType(queryInterface, TYPE_ENUM)
    await dropType(queryInterface, STATUS_ENUM)
  }
}
