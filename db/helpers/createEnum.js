const createEnum = async (queryInterface, enumName, enumValues) => {
  await queryInterface.sequelize.query(`
    CREATE TYPE ${enumName}
    AS ENUM (${enumValues.map(s => `'${s}'`).join(', ')})
  `)

  return enumName
}

module.exports = createEnum
