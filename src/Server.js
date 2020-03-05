import { ApolloServer, gql } from 'apollo-server'

import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import LogInWithGoogle from './business_actions/LogInWithGoogle'

const Server = new ApolloServer({
  resolvers: {
    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle, { passingInput: true })
    }
  },
  typeDefs
})

export default Server
