import seq from 'sequelize'

import BusinessAction from '$src/BusinessAction'
import { ArgentinaAreaCode } from '$src/models'

const DOCUMENT = 'argentina_area_codes_document("areaCode", province, localities)'

// PostgreSQL allows to escape single quotes in
// string literals by doubling the single quote (literally "''").
const escapeSingleQuote = str => str.replace("'", "''")

// Replaces accented vowels with's unaccented counterparts
// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const unaccent = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const getMatchedLocalities = (record, tokens) => {
  const pattern = new RegExp(tokens.join('|'))
  const localities = record.localities.filter(l => pattern.test(unaccent(l.toLowerCase())))
  return localities.length === 0 ? record.localities.slice(0, 3) : localities
}

class SearchArgentinaAreaCodes extends BusinessAction {
  async executePerform () {
    const { filter } = this.params

    const tokens =
      unaccent(filter)
        .toLowerCase() // TODO: check if this is really necessary
        .split(/\s+|\s*,\s*/)
        .filter(s => s.trim())

    const rawTsQuery =
      tokens
        .map(s => escapeSingleQuote(s) + ':*')
        .join(' & ')

    const tsQuery = `to_tsquery(unaccent('${rawTsQuery}'))`

    const results = await ArgentinaAreaCode.findAll({
      where: seq.literal(`${DOCUMENT} @@ ${tsQuery}`),
      order: seq.literal(`ts_rank(${DOCUMENT}, ${tsQuery})`)
    })

    return results.map(result => ({ ...result.dataValues, matchedLocalities: getMatchedLocalities(result, tokens) }))
  }
}

export default SearchArgentinaAreaCodes
