import { ApolloLogExtension } from 'apollo-log'
import { ApolloServer, gql, withFilter } from 'apollo-server'
import { Op } from 'sequelize'

import { sequelize } from './db'
import { Customer, Call, User, Task, Team, TeamMembership } from './models'
import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import AuthService from './AuthService'
import pubSub, { NOTIFICATION_ACTIVATED } from './pubSub'

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
import UpdateTask from  './business_actions/UpdateTask'
import CreateTeam from './business_actions/CreateTeam'
import InviteToTeam from './business_actions/InviteToTeam'
import UpdateCurrentUser from './business_actions/UpdateCurrentUser'

import TelemarketingSheetResolver from './typeResolvers/TelemarketingSheetResolver'

const Server = new ApolloServer({
  extensions: [_ => new ApolloLogExtension()],
  context: async ({ req, connection }) => {
    const token = connection ? connection.context.authorization : req.headers.authorization

    if (token) {
      const currentUser = await AuthService.getUser(token)
      return { currentUser }
    } else {
      throw new Error('No authentication present')
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
      updateTask: resolveWithBA(UpdateTask),
      createTeam: resolveWithBA(CreateTeam),
      inviteToTeam: resolveWithBA(InviteToTeam),
      updateCurrentUser: resolveWithBA(UpdateCurrentUser)
    },

    Subscription: {
      notificationActivated: {
        subscribe: withFilter(
          _ => pubSub.asyncIterator([NOTIFICATION_ACTIVATED]),
          ({ notificationActivated: notification }, _vars, { currentUser }) => notification.UserId === currentUser.id
        )
      }
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
      customer: async call => await Customer.findByPk(call.CustomerId),
      notes: async call => await new Call({ id: call.id }).getNotes(),
      // TODO: introduce a global solution for datetime types.
      // We can use a custom Scalar.
      dateTime: call => call.dateTime.toISOString()
    },

    Task: {
      user: async task => await User.findByPk(task.UserId),
      customer: async task => await Customer.findByPk(task.CustomerId),
      triggererCall: async task => await Call.findByPk(task.TriggererCallId),
      // TODO: same as with Call.dateTime resolver
      dueDate: task => task.dueDate && new Date(task.dueDate).toISOString()
    },

    User: {
      team: async user => {
        const teams = await new User({ id: user.id }).getTeams()
        return teams[0]
      },
      tasks: async user => await new User({ id: user.id }).getTasks({
        order: [
          [sequelize.fn('COALESCE', sequelize.col('dueDate'), sequelize.col('updatedAt')), 'DESC']
        ]
      })
    },

    Team: {
      memberships: async team => await new Team({ id: team.id }).getMemberships()
    },

    TeamMembership: {
      user: async membership => await User.findByPk(membership.UserId)
    },

    Notification: {
      activateAt: n => n.activateAt && new Date(n.activateAt).toISOString()
    }
  }
})

export default Server
