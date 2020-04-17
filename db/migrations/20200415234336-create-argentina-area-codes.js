'use strict'

const TABLE = 'ArgentinaAreaCodes'

const fs = require('fs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = queryInterface.sequelize.transaction()

    await queryInterface.createTable(TABLE, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      areaCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      province: {
        type: Sequelize.STRING,
        allowNull: false
      },
      localities: {
        type: Sequelize.ARRAY(Sequelize.STRING),
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
      CREATE EXTENSION unaccent;

      CREATE OR REPLACE FUNCTION argentina_area_codes_document(
        area_code text,
        province text,
        localities text[]
      )
        RETURNS tsvector
      AS
      $BODY$
        SELECT
          setweight(to_tsvector('simple', $1), 'A') ||
          setweight(to_tsvector('simple', unaccent($2)), 'C') ||
          setweight(to_tsvector('simple', unaccent(array_to_string($3, ','))), 'B')
      $BODY$
      LANGUAGE sql
      IMMUTABLE;

      CREATE INDEX argentina_area_codes_fs_index ON "ArgentinaAreaCodes" USING gin(
        argentina_area_codes_document("areaCode", province, localities)
      );
    `)
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TABLE)
  }
}
