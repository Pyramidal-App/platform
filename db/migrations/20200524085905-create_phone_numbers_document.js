'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;

      CREATE OR REPLACE FUNCTION phone_numbers_document(phone_number "PhoneNumbers")
      RETURNS tsvector
      AS
      $BODY$
        SELECT
          setweight(to_tsvector('simple', pn."countryCode"), 'C') ||
          setweight(to_tsvector('simple', pn."areaCode"), 'C') ||
          setweight(to_tsvector('simple', pn.number), 'A') ||
          setweight(to_tsvector('simple', string_agg(customer.name, ' ')), 'B') ||
          setweight(to_tsvector('simple', string_agg(u.email, ' ')), 'B') ||
          setweight(to_tsvector('simple', string_agg(u.name, ' ')), 'B')
        FROM "PhoneNumbers" pn

        LEFT JOIN "Calls" calls ON calls."PhoneNumberId" = pn.id
        LEFT JOIN "Users" u ON calls."UserId" = u.id

        LEFT JOIN "CustomersPhoneNumbers" customers_pns ON customers_pns."PhoneNumberId" = phone_number.id
        LEFT JOIN "Customers" customer ON customers_pns."CustomerId" = customer.id
        WHERE pn.id = phone_number.id
        GROUP BY pn.id
      $BODY$
      LANGUAGE sql
      IMMUTABLE;

      CREATE INDEX phone_numbers_fs_index ON "PhoneNumbers" USING gin(
        phone_numbers_document("PhoneNumbers")
      );
    `)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX phone_numbers_fs_index;
      DROP FUNCTION phone_numbers_document;
    `)
  }
};
