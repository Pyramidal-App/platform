'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query(`ALTER TABLE "Notes" ALTER COLUMN "CustomerId" DROP NOT NULL;`),

  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query(`ALTER TABLE "Notes" ALTER COLUMN "CustomerId" SET NOT NULL;`),
};
