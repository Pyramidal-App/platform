'use strict'

const createUniqueConstraint = (table, columns, options = {}) => {
  const constraintName = `${table}_unique_${columns.join('_')}`

  const up = async queryInterface =>
    queryInterface.addConstraint(table, columns, {
      type: 'unique',
      name: constraintName,
      ...options
    })

  const down = queryInterface =>
    queryInterface.removeConstraint(table, constraintName)

  return { up, down }
}

module.exports = createUniqueConstraint
