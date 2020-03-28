'use strict';

const ENUM_NAME = 'call_outcome'
const ENUM_VALUES = [
  'DIDNT_ANSWER',
  'NOT_INTERESTED',
  'SUCCESS',
  'DONT_CALL'
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TYPE ${ENUM_NAME}
      AS ENUM (${ENUM_VALUES.map(s => `'${s}'`).join(', ')})
    `)

    await queryInterface.createTable('Calls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      outcome: {
        type: ENUM_NAME,
        allowNull: false,
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Calls');
    await queryInterface.sequelize.query(`DROP TYPE ${ENUM_NAME}`)
  }
};
