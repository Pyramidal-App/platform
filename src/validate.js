import validate from 'validate.js'

validate.validators.custom = async (value, options) => {
  return await options.with(value)
}

validate.validators.aryLength = (value, options) => {
  if (options.lessThan && value.length < options.lessThan) {
    return [`must be less than ${options.lessThan}`]
  }
}

const matchesExistingRecord = (message, testThatExists = false) => async (value, options) => {
  if (!value) return;
  let record
  const model = options.inModel

  if (options.byAttribute) {
    const whereClauses = { [options.byAttribute]: value }
    record = await model.findOne({ where: whereClauses })
  } else {
    record = await model.findByPk(value)
  }


  if (testThatExists && !record) { return message }
  if (!testThatExists && record) { return message }
}

// These two are esentially the same validation but opposite
validate.validators.matchesExistingRecord =
  matchesExistingRecord('does not match an existing record', true)

validate.validators.unique =
  matchesExistingRecord('is taken')

export default validate
