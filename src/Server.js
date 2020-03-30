import { ApolloServer, gql } from 'apollo-server'
import { Op } from 'sequelize'
import times from 'lodash.times'

import { Customer, Call, PhoneNumber, User, Task } from './models'
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
import CreateCall from './business_actions/CreateCall'
import CreateTask from './business_actions/CreateTask'

const Server = new ApolloServer({
  context: async ({ req }) => {
    const token = req.headers.authorization

    if (token) {
      const currentUser = await AuthService.getUser(token)
      return { currentUser }
    }
  },
  typeDefs,
  resolvers: {
    Query: {
      telemarketingSheet: resolveWithBA(FindTelemarketingSheet, { passingInput: true }),
      telemarketingSheets: resolveWithBA(ListTelemarketingSheets),
      customer: resolveWithBA(FindCustomer, { passingInput: true })
    },
    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle, { passingInput: true }),
      findOrCreateTelemarketingSheet: resolveWithBA(FindOrCreateTelemarketingSheet, { passingInput: true }),
      createCustomer: resolveWithBA(CreateCustomer, { passingInput: true }),
      updateCustomer: resolveWithBA(UpdateCustomer, { passingInput: true }),
      updateAddress: resolveWithBA(UpdateAddress, { passingInput: true }),
      createCall: resolveWithBA(CreateCall, { passingInput: true }),
      createTask: resolveWithBA(CreateTask, { passingInput: true })
    },
    Customer: {
      phoneNumbers: async customer => await new Customer({ id: customer.id }).getPhoneNumbers(),
      addresses: async customer => await new Customer({ id: customer.id }).getAddresses(),
      calls: async customer => await new Customer({ id: customer.id }).getCalls(),
      tasks: async customer => await new Customer({ id: customer.id }).getTasks(),
    },
    Call: {
      user: async call => {
        // TODO: for some reason this is not working, returning null.
        // We should investigate it, and maybe open a bug in sequelize
        //const user = await new Call({ id: call.id }).getUser()
        return await User.findByPk(call.UserId)
      },
      notes: async call => await new Call({ id: call.id }).getNotes(),

      // TODO: introduce a global solution for datetime types.
      // We can use a custom Scalar.
      dateTime: call => call.dateTime.toISOString()
    },
    Task: {
      // TODO: same as with Call.user resolver
      user: async task => await User.findByPk(task.UserId),
      // TODO: same as with Call.dateTime resolver
      dueDate: task => task.dueDate.toISOString()
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
    },
  }
})

export default Server
