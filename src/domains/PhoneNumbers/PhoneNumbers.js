import { PhoneNumber } from '$src/models'

import SearchPhoneNumbers from './businessActions/SearchPhoneNumbers'
import FindOrCreatePhoneNumber from './businessActions/FindOrCreatePhoneNumber'

const PhoneNumbers = {
  search: SearchPhoneNumbers,
  findOrCreate: FindOrCreatePhoneNumber,
  findByPk: async id => await PhoneNumber.findByPk(id)
}

export default PhoneNumbers
