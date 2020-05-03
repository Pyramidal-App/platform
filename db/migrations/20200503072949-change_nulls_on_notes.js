'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Notes" ALTER COLUMN "CallId" DROP NOT NULL;
      ALTER TABLE "Notes" ALTER COLUMN "PhoneNumberId" DROP NOT NULL;
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Notes" ALTER COLUMN "CallId" SET NOT NULL;
      ALTER TABLE "Notes" ALTER COLUMN "PhoneNumberId" SET NOT NULL;
    `)
  }
};
