import { where } from '../Search'
import { Op } from 'sequelize'

/**
 * A simple HOF that generates a SQL filter, using equality op by default,
 * i.e, `SELECT FROM table WHERE somCol = someValue`
 */
const opFilter = (columnName, op = Op.eq) =>
  (queryOptions, value) => where(queryOptions, { [columnName]: { [op]: value } })

export default opFilter