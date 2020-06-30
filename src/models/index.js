import User from './User'
import TelemarketingSheet from './TelemarketingSheet'
import Customer from './Customer'
import CustomersPhoneNumber from './CustomersPhoneNumber'
import PhoneNumber from './PhoneNumber'
import Address from './Address'
import Interaction from './Interaction'
import Note from './Note'
import Task from './Task'
import Team from './Team'
import TeamMembership from './TeamMembership'
import Notification from './Notification'
import ArgentinaAreaCode from './ArgentinaAreaCode'
import GooglePlace from './GooglePlace'

User.hasMany(TelemarketingSheet)
User.hasMany(Customer)
User.hasMany(Interaction)
User.hasMany(Task)
User.hasMany(TeamMembership)
User.hasMany(Notification)
User.belongsToMany(Team, { through: TeamMembership })

TelemarketingSheet.belongsTo(User)

Address.belongsTo(Customer)

Customer.belongsTo(User)
Customer.hasMany(Address)
Customer.hasMany(CustomersPhoneNumber)
Customer.hasMany(Interaction)
Customer.hasMany(Task)
Customer.belongsToMany(PhoneNumber, { through: CustomersPhoneNumber })

CustomersPhoneNumber.belongsTo(Customer)
CustomersPhoneNumber.belongsTo(PhoneNumber)

PhoneNumber.hasMany(CustomersPhoneNumber)
PhoneNumber.hasMany(Interaction)
PhoneNumber.belongsToMany(Customer, { through: CustomersPhoneNumber })

Interaction.belongsTo(User)
Interaction.belongsTo(Customer)
Interaction.belongsTo(PhoneNumber)
Interaction.hasMany(Note)
Interaction.hasMany(Task, { as: 'triggeredCalls', foreignKey: 'TriggererCallId' })

Note.belongsTo(User)
Note.belongsTo(Customer)
Note.belongsTo(PhoneNumber)
Note.belongsTo(Interaction)

Task.belongsTo(User)
Task.belongsTo(Customer)
Task.belongsTo(Interaction, { as: 'triggererCall', foreignKey: 'TriggererCallId' })

Team.hasMany(TeamMembership, { as: 'memberships' })
Team.belongsToMany(User, { through: TeamMembership, as: 'members' })

TeamMembership.belongsTo(Team)
TeamMembership.belongsTo(User)

Notification.belongsTo(User)

GooglePlace.belongsTo(PhoneNumber)

// TODO: remove this after renaming "Customer" to "Contact"
const Contact = Customer

export {
  User,
  TelemarketingSheet,
  Customer,
  Contact,
  CustomersPhoneNumber,
  PhoneNumber,
  Address,
  Interaction,
  Note,
  Task,
  Team,
  TeamMembership,
  Notification,
  ArgentinaAreaCode,
  GooglePlace
}
