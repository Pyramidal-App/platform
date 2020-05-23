import seq from 'sequelize'
import { where, order } from '../Search'

// PostgreSQL allows to escape single quotes in
// string literals by doubling the single quote (literally "''").
const escapeSingleQuote = str => str.replace("'", "''")

// Replaces accented vowels with's unaccented counterparts
// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const unaccent = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Splits user query into tokens that we can use to build a Postgres TS query
const tokenize = string => (
  unaccent(string)
    .toLowerCase() // TODO: check if this is really necessary
    .split(/\s+|\s*,\s*/)
    .filter(s => s.trim())
)
const fulltextFilter = document => (queryOptions, value) => {
  const tokens = tokenize(value)
  const rawTsQuery = tokens.map(s => escapeSingleQuote(s) + ':*').join(' & ')
  const tsQuery = `to_tsquery(unaccent('${rawTsQuery}'))`

  return (
    queryOptions
    |> where(#, seq.literal(`${document} @@ ${tsQuery}`),)
    |> order(#, seq.literal(`ts_rank(${document}, ${tsQuery})`))
  )
}

export { tokenize, unaccent }
export default fulltextFilter
