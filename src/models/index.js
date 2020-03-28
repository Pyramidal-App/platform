import User from './User'
import TelemarketingSheet from './TelemarketingSheet'
import Customer from './Customer'
import CustomersPhoneNumber from './CustomersPhoneNumber'
import PhoneNumber from './PhoneNumber'
import Address from './Address'
import Call from './Call'
import Note from './Note'

User.hasMany(TelemarketingSheet)
User.hasMany(Customer)
User.hasMany(Call)

TelemarketingSheet.belongsTo(User)

Address.belongsTo(Customer)

Customer.belongsTo(User)
Customer.hasMany(Address)
Customer.hasMany(CustomersPhoneNumber)
Customer.hasMany(Call)
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

Note.belongsTo(User)
Note.belongsTo(Customer)
Note.belongsTo(PhoneNumber)
Note.belongsTo(Call)

export {
  User,
  TelemarketingSheet,
  Customer,
  CustomersPhoneNumber,
  PhoneNumber,
  Address,
  Call,
  Note
}
