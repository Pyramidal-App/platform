'use strict' 
const fs = require('fs')
const path = require('path')
const data = require('./data/ArgentinaAreaCodes.json')

const escapeLocality = l => l.replace("'", "\\'")

module.exports = {
  up: async (qi, Sequelize) => {
    const transaction = await qi.sequelize.transaction()

    await qi.sequelize.query('DELETE FROM "ArgentinaAreaCodes"', { transaction })

    try {
      for (const row of data) {
        const localities = row.localities.filter(l => l.trim()).map(escapeLocality).join(', ')

        const query = `
          INSERT INTO "ArgentinaAreaCodes" (id, "areaCode", province, localities, "createdAt", "updatedAt")
          VALUES (DEFAULT, '${row.areaCode}', '${row.province}', E'{${localities}}', now(), now())
        `

        await qi.sequelize.query(query, { transaction })
      }

      transaction.commit()
    } catch (error) {
      transaction.rollback()
      throw error
    }
  },

  down: (qI, Sequelize) => {}
}
