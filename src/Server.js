import { ApolloServer, gql } from 'apollo-server'

import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import AuthService from './AuthService'

import LogInWithGoogle from './business_actions/LogInWithGoogle'
import FindOrCreateTelemarketingSheet from './business_actions/FindOrCreateTelemarketingSheet'
import FindTelemarketingSheet from './business_actions/FindTelemarketingSheet'
import ListTelemarketingSheets from './business_actions/ListTelemarketingSheets'
import CreateCustomer from './business_actions/CreateCustomer'
import FindCustomer from './business_actions/FindCustomer'

const Server = new ApolloServer({
  resolvers: {
    Query: {
      telemarketingSheet: resolveWithBA(FindTelemarketingSheet, {
        passingInput: true
      }),
      telemarketingSheets: resolveWithBA(ListTelemarketingSheets),
      customer: resolveWithBA(FindCustomer, { passingInput: true })
    },
    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle, { passingInput: true }),
      findOrCreateTelemarketingSheet: resolveWithBA(
        FindOrCreateTelemarketingSheet,
        { passingInput: true }
      ),
      createCustomer: resolveWithBA(CreateCustomer, { passingInput: true })
    }
  },
  typeDefs,
  context: async ({ req }) => {
    const token = req.headers.authorization

    if (token) {
      const currentUser = await AuthService.getUser(token)
      return { currentUser }
    }
  }
})

export default Server
