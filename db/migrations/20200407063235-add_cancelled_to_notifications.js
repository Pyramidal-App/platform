'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Notifications', 'cancelled', {
      type: Sequelize.BOOLEAN
    })
  ,

  down: (queryInterface, Sequelize) => 
    queryInterface.removeColumn('Notifications', 'cancelled')
};
