import { ApolloServer, gql } from 'apollo-server'
import { Customer, PhoneNumber } from './models'
import { Op } from 'sequelize'
import times from 'lodash.times'

import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import AuthService from './AuthService'

import LogInWithGoogle from './business_actions/LogInWithGoogle'
import FindOrCreateTelemarketingSheet from './business_actions/FindOrCreateTelemarketingSheet'
import FindTelemarketingSheet from './business_actions/FindTelemarketingSheet'
import ListTelemarketingSheets from './business_actions/ListTelemarketingSheets'
import CreateCustomer from './business_actions/CreateCustomer'
import FindCustomer from './business_actions/FindCustomer'
import UpdateCustomer from './business_actions/UpdateCustomer'
import UpdateAddress from './business_actions/UpdateAddress'

const Server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      telemarketingSheet: resolveWithBA(FindTelemarketingSheet, { passingInput: true }),
      telemarketingSheets: resolveWithBA(ListTelemarketingSheets),
      customer: resolveWithBA(FindCustomer, { passingInput: true }),
    },
    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle, { passingInput: true }),
      findOrCreateTelemarketingSheet: resolveWithBA(FindOrCreateTelemarketingSheet, { passingInput: true }),
      createCustomer: resolveWithBA(CreateCustomer, { passingInput: true }),
      updateCustomer: resolveWithBA(UpdateCustomer, { passingInput: true }),
      updateAddress: resolveWithBA(UpdateAddress, { passingInput: true })
    },
    Customer: {
      phoneNumbers: async customer => await new Customer({ id: customer.id }).getPhoneNumbers(),
      addresses: async customer => await new Customer({ id: customer.id }).getAddresses()
    },
    TelemarketingSheet: {
      numberInfo: async sheet => {
        const { countryCode, areaCode, firstNumbers } = sheet.dataValues

        const phoneNumbersWithContact = await PhoneNumber.findAll({
          where: {
            countryCode,
            areaCode,
            number: { [Op.iRegexp]: `^${firstNumbers}` }
          },
          include: [{ model: Customer, isRequired: true }]
        })

        return times(100, n => {
          const lastNumbers = n.toString().padStart(2, '0')
          const hasContact = !!phoneNumbersWithContact.find(pn => pn.number.slice(-2) === lastNumbers)
          const hasPendingTasks = false
          const dontCall = false

          return { lastNumbers, hasContact, hasPendingTasks, dontCall }
        })
      }
    }

  },
  context: async ({ req }) => {
    const token = req.headers.authorization

    if (token) {
      const currentUser = await AuthService.getUser(token)
      return { currentUser }
    }
  }
})

export default Server
