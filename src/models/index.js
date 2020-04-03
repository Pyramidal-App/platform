import User from './User'
import TelemarketingSheet from './TelemarketingSheet'
import Customer from './Customer'
import CustomersPhoneNumber from './CustomersPhoneNumber'
import PhoneNumber from './PhoneNumber'
import Address from './Address'
import Call from './Call'
import Note from './Note'
import Task from './Task'
import Team from './Team'
import TeamMembership from './TeamMembership'

User.hasMany(TelemarketingSheet)
User.hasMany(Customer)
User.hasMany(Call)
User.hasMany(Task)
User.hasMany(TeamMembership)
User.belongsToMany(Team, { through: TeamMembership })

TelemarketingSheet.belongsTo(User)

Address.belongsTo(Customer)

Customer.belongsTo(User)
Customer.hasMany(Address)
Customer.hasMany(CustomersPhoneNumber)
Customer.hasMany(Call)
Customer.hasMany(Task)
Customer.belongsToMany(PhoneNumber, { through: CustomersPhoneNumber })

CustomersPhoneNumber.belongsTo(Customer)
CustomersPhoneNumber.belongsTo(PhoneNumber)

PhoneNumber.hasMany(CustomersPhoneNumber)
PhoneNumber.hasMany(Call)
PhoneNumber.belongsToMany(Customer, { through: CustomersPhoneNumber })

Call.belongsTo(User)
Call.belongsTo(Customer)
Call.belongsTo(PhoneNumber)
Call.hasMany(Note)
Call.hasMany(Task, { as: 'triggeredCalls', foreignKey: 'TriggererCallId' })

Note.belongsTo(User)
Note.belongsTo(Customer)
Note.belongsTo(PhoneNumber)
Note.belongsTo(Call)

Task.belongsTo(User)
Task.belongsTo(Customer)
Task.belongsTo(Call, { as: 'triggererCall', foreignKey: 'TriggererCallId' })

Team.hasMany(TeamMembership, { as: 'memberships' })
Team.belongsToMany(User, { through: TeamMembership })

TeamMembership.belongsTo(Team)
TeamMembership.belongsTo(User)

export {
  User,
  TelemarketingSheet,
  Customer,
  CustomersPhoneNumber,
  PhoneNumber,
  Address,
  Call,
  Note,
  Task,
  Team,
  TeamMembership
}
