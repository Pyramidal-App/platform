import { ApolloLogExtension } from 'apollo-log'
import { ApolloServer, gql, withFilter } from 'apollo-server'
import { GraphQLDateTime } from 'graphql-iso-date'
import set from 'lodash.set'
import slugify from '@sindresorhus/slugify'
import visibleToUser from '$src/Search/search_filters/visibleToUser'

import {
  Customer,
  Call,
  User,
  Task,
  Team,
  TeamMembership,
  Notification,
  PhoneNumber,
  Note
} from './models'

import typeDefs from './schema.graphql'
import AuthService from './AuthService'
import pubSub, { NOTIFICATION_ACTIVATED } from './pubSub'

import resolveWithBA from './resolveWithBA.js'
import resolveWithSearch from './resolveWithSearch'

import Tasks from '$src/domains/Tasks'
import Notifications from '$src/domains/Notifications'
import Customers from '$src/domains/Customers'
import InteractionRegistry from '$src/domains/InteractionRegistry'
import Notes from '$src/domains/Notes'
import Teams from '$src/domains/Teams'
import PhoneNumbers from '$src/domains/PhoneNumbers'

import LogInWithGoogle from './business_actions/LogInWithGoogle'
import FindOrCreateTelemarketingSheet from './business_actions/FindOrCreateTelemarketingSheet'
import FindTelemarketingSheet from './business_actions/FindTelemarketingSheet'
import ListTelemarketingSheets from './business_actions/ListTelemarketingSheets'
import UpdateAddress from './business_actions/UpdateAddress'
import CreateCall from './business_actions/CreateCall'
import UpdateCurrentUser from './business_actions/UpdateCurrentUser'
import SearchArgentinaAreaCodes from './business_actions/SearchArgentinaAreaCodes'
import GetGooglePlacesInfo from './business_actions/GetGooglePlacesInfo'

import TelemarketingSheetResolver from './typeResolvers/TelemarketingSheetResolver'
import CallResolver from './typeResolvers/CallResolver'

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
      currentUser: (_root, _args, { currentUser }) => currentUser,
      argentinaAreaCodes: resolveWithBA(SearchArgentinaAreaCodes, { passingInput: false }),
      phoneNumbers: resolveWithSearch(PhoneNumbers.search, { filterVisibleToUser: false })
    },

    Mutation: {
      logInWithGoogle: resolveWithBA(LogInWithGoogle),
      findOrCreateTelemarketingSheet: resolveWithBA(
        FindOrCreateTelemarketingSheet
      ),
      updateAddress: resolveWithBA(UpdateAddress),
      createCall: resolveWithBA(CreateCall),
      updateCurrentUser: resolveWithBA(UpdateCurrentUser),

      createTeam: resolveWithBA(Teams.create),
      destroyTeam: resolveWithBA(Teams.destroy, { passingInput: false }),
      inviteToTeam: resolveWithBA(Teams.invite),
      leaveTeam: resolveWithBA(Teams.leave, { passingInput: false }),
      removeTeamMember: resolveWithBA(Teams.removeMember),

      createCustomer: resolveWithBA(Customers.create),
      updateCustomer: resolveWithBA(Customers.update),
      destroyContact: resolveWithBA(Customers.destroy, { passingInput: false }),

      createTask: resolveWithBA(Tasks.create),
      cancelTask: resolveWithBA(Tasks.cancel, { passingInput: false }),
      completeTask: resolveWithBA(Tasks.complete, { passingInput: false }),

      markNotificationsRead: resolveWithBA(Notifications.markAsRead, {
        passingInput: false
      }),

      createNote: resolveWithBA(Notes.create),
      deleteNote: resolveWithBA(Notes.delete, { passingInput: false }),

      getGooglePlacesInfo: resolveWithBA(GetGooglePlacesInfo, { passingInput: false })
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

    Call: CallResolver,
    TelemarketingSheet: TelemarketingSheetResolver,

    Customer: {
      phoneNumbers: async customer =>
        await new Customer({ id: customer.id }).getPhoneNumbers(),
      addresses: async customer =>
        await new Customer({ id: customer.id }).getAddresses(),
      calls: async customer =>
        await new Customer({ id: customer.id }).getCalls(),
      tasks: resolveWithSearch(Tasks.search, {
        queryOptions: customer => ({ where: { CustomerId: customer.id } })
      }),
      userId: customer => customer.UserId,
      user: async customer => await User.findByPk(customer.UserId),
      slug: customer => slugify(`${customer.id}-${customer.name}`),
      calls: resolveWithSearch(InteractionRegistry.search, {
        queryOptions: customer => ({ where: { CustomerId: customer.id } })
      }),
      notes: resolveWithSearch(Notes.search, {
        queryOptions: customer => ({ where: { CustomerId: customer.id } })
      })
    },

    Task: {
      user: async task => await User.findByPk(task.UserId),
      customer: async task => await Customer.findByPk(task.CustomerId),
      triggererCall: async task => await Call.findByPk(task.TriggererCallId),
    },

    User: {
      team: async user => {
        const teams = await new User({ id: user.id }).getTeams()
        return teams[0]
      },

      tasks: resolveWithSearch(Tasks.search),

      notifications: async (user, vars) => {
        const filters = vars.hasOwnProperty('read') ? { read: vars.read } : {}
        const limit = vars.limit || 5
        const notifications = await Notification.findAll({
          limit,
          where: { ...filters, UserId: user.id }
        })

        return notifications
      },

      customers: resolveWithSearch(Customers.search)
    },

    Team: {
      memberships: async team =>
        await new Team({ id: team.id }).getMemberships(),
      members: async team => await new Team({ id: team.id }).getMembers(),
      admins: async team => await new Team({ id: team.id }).getMemberships({
        where: { admin: true },
        include: [{ model: User }]
      }).map(tm => tm.User),
    },

    TeamMembership: {
      user: async membership => await User.findByPk(membership.UserId)
    },

    PhoneNumber: {
      displayValue: pn => `+${pn.countryCode} (${pn.areaCode}) ${pn.number}`,
      telemarketingPrefix: pn => pn.number.slice(0, -2),
      displayTelemarketingPrefix: pn => `+${pn.countryCode} (${pn.areaCode}) ${pn.number.slice(0, -2)}**`,
      isMobile: pn => pn.areaCode[0] === '9',
      //customers: pn => pn.getCustomers(),
      customers: async (pn, _input, { currentUser }) => (
        ({})
        |> await visibleToUser(#, currentUser.id)
        |> await pn.getCustomers(#)
      ),
      lastInteraction: async pn => {
        const [lastInteraction] = await pn.getCalls({ 
          order: [['createdAt', 'desc']],
          limit: 1
        })

        return lastInteraction
      },
    },

    Note: {
      user: async note => await note.getUser(),
      call: async note => await note.getCall()
    },

    GooglePlace: {
      phoneNumber: async gp => await gp.getPhoneNumber()
    }
  }
})

export default Server
