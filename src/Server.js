import { ApolloLogExtension } from 'apollo-log'
import { ApolloServer, gql } from 'apollo-server'
import { Op } from 'sequelize'

import { Customer, Call, User, Task, Team, TeamMembership } from './models'
import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import AuthService from './AuthService'

import LogInWithGoogle from './business_actions/LogInWithGoogle'
import FindOrCreateTelemarketingSheet from './business_actions/FindOrCreateTelemarketingSheet'
import FindTelemarketingSheet from './business_actions/FindTelemarketingSheet'
import ListTelemarketingSheets from './business_actions/ListTelemarketingSheets'
import CreateCustomer from './business_actions/CreateCustomer'
import FindCustomers from './business_actions/FindCustomers'
import UpdateCustomer from './business_actions/UpdateCustomer'
import UpdateAddress from './business_actions/UpdateAddress'
import CreateCall from './business_actions/CreateCall'
import CreateTask from './business_actions/CreateTask'
import CreateTeam from './business_actions/CreateTeam'
import InviteToTeam from './business_actions/InviteToTeam'
import UpdateCurrentUser from './business_actions/UpdateCurrentUser'

import TelemarketingSheetResolver from './typeResolvers/TelemarketingSheetResolver'

const Server = new ApolloServer({
  extensions: [_ => new ApolloLogExtension()],
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
      telemarketingSheet: resolveWithBA(FindTelemarketingSheet),
      telemarketingSheets: resolveWithBA(ListTelemarketingSheets, { passingInput: false }),
      customers: resolveWithBA(FindCustomers),
      currentUser: (_root, _args, { currentUser }) => currentUser
    },
    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle),
      findOrCreateTelemarketingSheet: resolveWithBA(FindOrCreateTelemarketingSheet),
      createCustomer: resolveWithBA(CreateCustomer),
      updateCustomer: resolveWithBA(UpdateCustomer),
      updateAddress: resolveWithBA(UpdateAddress),
      createCall: resolveWithBA(CreateCall),
      createTask: resolveWithBA(CreateTask),
      createTeam: resolveWithBA(CreateTeam),
      inviteToTeam: resolveWithBA(InviteToTeam),
      updateCurrentUser: resolveWithBA(UpdateCurrentUser)
    },
    TelemarketingSheet: TelemarketingSheetResolver,
    Customer: {
      phoneNumbers: async customer => await new Customer({ id: customer.id }).getPhoneNumbers(),
      addresses: async customer => await new Customer({ id: customer.id }).getAddresses(),
      calls: async customer => await new Customer({ id: customer.id }).getCalls(),
      tasks: async customer => await new Customer({ id: customer.id }).getTasks(),
      userId: customer => customer.UserId,
      user: async customer => await User.findByPk(customer.UserId),
    },
    Call: {
      user: async call => await User.findByPk(call.UserId),
      notes: async call => await new Call({ id: call.id }).getNotes(),
      // TODO: introduce a global solution for datetime types.
      // We can use a custom Scalar.
      dateTime: call => call.dateTime.toISOString()
    },
    Task: {
      user: async task => await User.findByPk(task.UserId),
      // TODO: same as with Call.dateTime resolver
      dueDate: task => task.dueDate.toISOString()
    },
    User: {
      team: async user => {
        const teams = await new User({ id: user.id }).getTeams()
        return teams[0]
      }
    },
    Team: {
      memberships: async team => await new Team({ id: team.id }).getMemberships()
    },
    TeamMembership: {
      user: async membership => await User.findByPk(membership.UserId)
    }
  }
})

export default Server
