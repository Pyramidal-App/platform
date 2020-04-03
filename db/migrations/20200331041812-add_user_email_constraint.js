'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Users', ['email'], {
      type: 'unique',
      name: 'unique_user_emails'
    })

    await queryInterface.sequelize.query(`
      ALTER TABLE "Users"
      ADD CONSTRAINT valid_user_emails
      CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'unique_user_emails')
    await queryInterface.removeConstraint('Users', 'valid_user_emails')
  }
};
