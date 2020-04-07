import validate from 'validate.js'

validate.validators.custom = async (value, options) => {
  return await options.with(value)
}

validate.validators.aryLength = (value, options) => {
  if (options.lessThan && value.length < options.lessThan) {
    return [`must be less than ${options.lessThan}`]
  }
}

const matchesExistingRecord = (
  defaultMessage,
  testThatExists = false
) => async (value, options) => {
  console.log('pete')
  if (!value) return

  const model = options.inModel
  const message = options.message || defaultMessage

  let recordCount

  if (options.getRecordCount) {
    recordCount = await options.getRecordCount(value)
  } else if (options.byAttribute) {
    const whereClauses = { [options.byAttribute]: value }
    recordCount = await model.count({ where: whereClauses })
  } else {
    throw new Error('Please specify either options.getRecordCount or options.byAttribute is missing')
  }

  if (testThatExists && recordCount <= 0) {
    return message
  }
  if (!testThatExists && recordCount > 0) {
    return message
  }
}

// These two are esentially the same validation but opposite
validate.validators.matchesExistingRecord = matchesExistingRecord(
  'does not match an existing record',
  true
)

validate.validators.unique = matchesExistingRecord('is taken')

validate.validators.presence.message = '^Este campo puede estar en blanco'

/*
* Validator
*/
export default validate
