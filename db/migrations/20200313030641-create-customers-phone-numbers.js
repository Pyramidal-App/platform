'use strict';

const TABLE_NAME = 'CustomersPhoneNumbers'
const UNIQUE_ATTRIBUTES = ['CustomerId', 'PhoneNumberId']
const CONSTRAINT_NAME = 'unique_customers_phone_numbers'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_NAME, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        refereces: {
          model: 'Customers',
          key: 'id'
        }
      },
      PhoneNumberId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        refereces: {
          model: 'PhoneNumbers',
          key: 'id'
        }
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

    await queryInterface.addConstraint(
      TABLE_NAME,
      UNIQUE_ATTRIBUTES,
      { type: 'unique', name: CONSTRAINT_NAME }
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(TABLE_NAME, CONSTRAINT_NAME)
    await queryInterface.dropTable(TABLE_NAME)
  }
};
