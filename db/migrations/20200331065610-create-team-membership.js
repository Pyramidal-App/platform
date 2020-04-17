'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TeamMemberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TeamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Teams', id: 'id' }
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', id: 'id' }
      },
      admin: {
        type: Sequelize.BOOLEAN
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
      'TeamMemberships',
      ['TeamId', 'UserId'],
      {
        type: 'unique',
        name: 'unique_team_memberships'
      }
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TeamMemberships')
  }
}
