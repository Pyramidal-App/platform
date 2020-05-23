'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;

      CREATE OR REPLACE FUNCTION customers_document(customer "Customers")
      RETURNS tsvector
      AS
      $BODY$
        SELECT
          setweight(to_tsvector('simple', customer.name), 'A') ||
          setweight(to_tsvector('Spanish', address.label), 'B') ||
          setweight(to_tsvector('simple', string_agg(pn."countryCode", ' ')), 'B') ||
          setweight(to_tsvector('simple', string_agg(pn."areaCode", ' ')), 'B') ||
          setweight(to_tsvector('simple', string_agg(pn.number, ' ')), 'B') ||
          setweight(to_tsvector('Spanish', string_agg(note.body, ' ')), 'C')
          FROM "Customers" c
        LEFT JOIN "CustomersPhoneNumbers" cpn ON cpn."CustomerId" = c.id
        LEFT JOIN "PhoneNumbers" pn ON cpn."PhoneNumberId" = pn.id
        LEFT JOIN "Addresses" address ON address."CustomerId" = c.id
        LEFT JOIN "Notes" note ON note."CustomerId" = customer.id
        WHERE c.id = customer.id
        GROUP BY address.label
      $BODY$
      LANGUAGE sql
      IMMUTABLE;;

      CREATE INDEX customers_fs_index ON "Customers" USING gin(
        customers_document("Customers")
      );
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX customers_fs_index;
      DROP FUNCTION customers_document;
    `)
  }
};
