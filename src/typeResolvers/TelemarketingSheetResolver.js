import { Op } from 'sequelize'
import times from 'lodash.times'

import { PhoneNumber, Customer } from '../models'

const collectionContainsNumber = (collection, lastNumbers) =>
  !!collection.find(pn => pn.number.slice(-2) === lastNumbers)

const TelemarketingSheetResolver = {
  numberInfo: async (sheet, _args, { currentUser }) => {
    const { countryCode, areaCode, firstNumbers } = sheet.dataValues

    const findPhoneNumbers = async userId =>
      await PhoneNumber.findAll({
        where: {
          countryCode,
          areaCode,
          number: { [Op.iRegexp]: `^${firstNumbers}` }
        },
        include: [
          {
            model: Customer,
            isRequired: true,
            where: { UserId: userId }
          }
        ]
      })

    const phoneNumbers = await findPhoneNumbers(currentUser.id)

    const [team] = await currentUser.getTeams()
    const teamMembers = team && await team.getMembers({
      where: { id: { [Op.ne]: currentUser.id } }
    })
    const teamPhoneNumbers = teamMembers && await findPhoneNumbers(teamMembers.map(tm => tm.id))

    return times(100, n => {
      const lastNumbers = n.toString().padStart(2, '0')
      const hasContact = collectionContainsNumber(phoneNumbers, lastNumbers)
      const teamHasContact = !!teamPhoneNumbers && collectionContainsNumber(
        teamPhoneNumbers,
        lastNumbers
      )
      const hasPendingTasks = false
      const dontCall = false

      return { lastNumbers, hasContact, teamHasContact, hasPendingTasks, dontCall }
    })
  }
}

export default TelemarketingSheetResolver
