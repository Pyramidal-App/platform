'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      activateAt: {
        type: Sequelize.DATE
      },
      read: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' }
      },
      payload: {
        type: Sequelize.JSONB,
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

    await queryInterface.sequelize.query(`
      ALTER TABLE "Notifications"
      ADD CONSTRAINT "activateAtIsFuture"
      CHECK ("activateAt" > "createdAt");

      ALTER TABLE "Tasks"
      ADD CONSTRAINT "dueDateIsFuture"
      CHECK ("dueDate" > "createdAt");
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Notifications');
    await queryInterface.removeConstraint('Tasks', 'dueDateIsFuture')
  }
};
