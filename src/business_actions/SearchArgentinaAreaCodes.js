import BusinessAction from '$src/BusinessAction'
import { ArgentinaAreaCode } from '$src/models'
import fulltextFilter, { tokenize, unaccent } from '$src/Search/search_filters/fulltextFilter'

const DOCUMENT = 'argentina_area_codes_document("areaCode", province, localities)'

const getMatchedLocalities = (record, tokens) => {
  const pattern = new RegExp(tokens.join('|'))
  const localities = record.localities.filter(l => pattern.test(unaccent(l.toLowerCase())))
  return localities.length === 0 ? record.localities.slice(0, 3) : localities
}

const buildQueryOptions = fulltextFilter(DOCUMENT)

// TODO: extend from Search.
class SearchArgentinaAreaCodes extends BusinessAction {
  async executePerform () {
    const { filter } = this.params

    const results =
      buildQueryOptions({}, filter)
      |> await ArgentinaAreaCode.findAll(#)

    const tokens = tokenize(filter)

    return results.map(result => ({
      ...result.dataValues,
      matchedLocalities: getMatchedLocalities(result, tokens)
    }))
  }
}

export default SearchArgentinaAreaCodes
