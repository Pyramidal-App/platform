import { ApolloLogExtension } from 'apollo-log'
import { ApolloServer, gql, withFilter } from 'apollo-server'
import { Op } from 'sequelize'
import { GraphQLDateTime } from 'graphql-iso-date'
import set from 'lodash.set'

import {
  Customer,
  Call,
  User,
  Task,
  Team,
  TeamMembership,
  Notification
} from './models'
import typeDefs from './schema.graphql'
import resolveWithBA from './resolveWithBA.js'
import AuthService from './AuthService'
import pubSub, { NOTIFICATION_ACTIVATED } from './pubSub'

import Tasks from '$src/domains/Tasks'
import Notifications from '$src/domains/Notifications'
import Customers from '$src/domains/Customers'

import LogInWithGoogle from './business_actions/LogInWithGoogle'
import FindOrCreateTelemarketingSheet from './business_actions/FindOrCreateTelemarketingSheet'
import FindTelemarketingSheet from './business_actions/FindTelemarketingSheet'
import ListTelemarketingSheets from './business_actions/ListTelemarketingSheets'
import UpdateAddress from './business_actions/UpdateAddress'
import CreateCall from './business_actions/CreateCall'
import CreateTeam from './business_actions/CreateTeam'
import InviteToTeam from './business_actions/InviteToTeam'
import UpdateCurrentUser from './business_actions/UpdateCurrentUser'

import TelemarketingSheetResolver from './typeResolvers/TelemarketingSheetResolver'

const Server = new ApolloServer({
  extensions: [_ => new ApolloLogExtension()],
  context: async ({ req, connection }) => {
    const token = connection
      ? connection.context.authorization
      : req.headers.authorization

    if (token) {
      try {
        const currentUser = await AuthService.getUser(token)
        return { currentUser }
      } catch (error) {
        console.error(error)
      }
    }
  },
  typeDefs,
  resolvers: {
    // Custom scalar
    DateTime: GraphQLDateTime,

    Query: {
      telemarketingSheet: resolveWithBA(FindTelemarketingSheet),
      telemarketingSheets: resolveWithBA(ListTelemarketingSheets, {
        passingInput: false
      }),
      currentUser: (_root, _args, { currentUser }) => currentUser
    },

    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle),
      findOrCreateTelemarketingSheet: resolveWithBA(
        FindOrCreateTelemarketingSheet
      ),
      updateAddress: resolveWithBA(UpdateAddress),
      createCall: resolveWithBA(CreateCall),
      createTeam: resolveWithBA(CreateTeam),
      inviteToTeam: resolveWithBA(InviteToTeam),
      updateCurrentUser: resolveWithBA(UpdateCurrentUser),

      createCustomer: resolveWithBA(Customers.create),
      updateCustomer: resolveWithBA(Customers.update),

      createTask: resolveWithBA(Tasks.create),
      cancelTask: resolveWithBA(Tasks.cancel, { passingInput: false }),
      completeTask: resolveWithBA(Tasks.complete, { passingInput: false }),

      markNotificationsRead: resolveWithBA(Notifications.markAsRead, {
        passingInput: false
      })
    },

    Subscription: {
      notificationActivated: {
        subscribe: withFilter(
          _ => pubSub.asyncIterator([NOTIFICATION_ACTIVATED]),
          ({ notificationActivated: notification }, _vars, { currentUser }) =>
            notification.UserId === currentUser.id
        )
      }
    },

    TelemarketingSheet: TelemarketingSheetResolver,

    Customer: {
      phoneNumbers: async customer =>
        await new Customer({ id: customer.id }).getPhoneNumbers(),
      addresses: async customer =>
        await new Customer({ id: customer.id }).getAddresses(),
      calls: async customer =>
        await new Customer({ id: customer.id }).getCalls(),
      tasks: async customer =>
        await new Customer({ id: customer.id }).getTasks(),
      userId: customer => customer.UserId,
      user: async customer => await User.findByPk(customer.UserId)
    },

    Call: {
      user: async call => await User.findByPk(call.UserId),
      customer: async call => await Customer.findByPk(call.CustomerId),
      notes: async call => await new Call({ id: call.id }).getNotes()
    },

    Task: {
      user: async task => await User.findByPk(task.UserId),
      customer: async task => await Customer.findByPk(task.CustomerId),
      triggererCall: async task => await Call.findByPk(task.TriggererCallId)
    },

    User: {
      team: async user => {
        const teams = await new User({ id: user.id }).getTeams()
        return teams[0]
      },

      tasks: async (user, { input: searchParams }, { currentUser }) =>
        await new Tasks.search(
          set({ ...searchParams }, 'filters.assignedToUser', currentUser.id),
          currentUser
        ).perform(),

      notifications: async (user, vars) => {
        const filters = vars.hasOwnProperty('read') ? { read: vars.read } : {}
        const limit = vars.limit || 5
        const notifications = await Notification.findAll({
          limit,
          where: { ...filters, UserId: user.id }
        })

        return notifications
      },

      customers: async (user, { input: searchParams }, { currentUser }) =>
        await new Customers.search(
          set({ ...searchParams }, 'filters.visibleToUser', currentUser.id),
          currentUser
        ).perform()
    },

    Team: {
      memberships: async team =>
        await new Team({ id: team.id }).getMemberships(),
      members: async team => await new Team({ id: team.id }).getMembers()
    },

    TeamMembership: {
      user: async membership => await User.findByPk(membership.UserId)
    }
  }
})

export default Server
