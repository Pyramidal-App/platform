'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      lat: { type: Sequelize.DOUBLE, allowNull: false },
      lng: { type: Sequelize.DOUBLE, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      googlePlaceId: { type: Sequelize.STRING, allowNull: false },
      notes: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Addresses')
  }
}
