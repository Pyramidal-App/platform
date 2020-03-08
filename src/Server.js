import { ApolloServer, gql } from 'apollo-server'

import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import AuthService from './AuthService'

import LogInWithGoogle from './business_actions/LogInWithGoogle'
import CreateTelemarketingSheet from './business_actions/CreateTelemarketingSheet'
import FindTelemarketingSheet from './business_actions/FindTelemarketingSheet'

const Server = new ApolloServer({
  resolvers: {
    Query: {
      telemarketingSheet: resolveWithBA(FindTelemarketingSheet)
    },
    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle, { passingInput: true }),
      createTelemarketingSheet: resolveWithBA(CreateTelemarketingSheet, { passingInput: true })
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
