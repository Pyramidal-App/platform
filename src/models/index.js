import User from './User'
import TelemarketingSheet from './TelemarketingSheet'

User.hasMany(TelemarketingSheet)
TelemarketingSheet.belongsTo(User)

export { User, TelemarketingSheet }
