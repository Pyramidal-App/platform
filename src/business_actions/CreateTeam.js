import uniq from 'lodash.uniq'

import { Sequelize, sequelize } from '../db'
import BusinessAction from '../BusinessAction'
import { Team, TeamMembership, User } from '../models'

const COMMA_SEPARATED_EMAILS_REGEX = (_ => {
  const s = /(?:[\s\n\r,]+)/.source // spacing
  const e = /(?:[^@,]+@[^@,]+\.[^@,]+)/.source // an email
  return new RegExp(`^${s}?${e}${s}?(${s}${e}${s}?)*$`)
})()

class CreateTeam extends BusinessAction {
  transactionIsolationLevel = Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED

  validationConstraints = {
    name: {
      presence: { allowEmpty: false },
      unique: {
        inModel: Team,
        byAttribute: 'name',
        message: '^Ya existe un equipo con este nombre'
      }
    },
    members: {
      presence: { allowEmpty: false },
      format: {
        pattern: COMMA_SEPARATED_EMAILS_REGEX,
        message: '^Formato invalido'
      }
    }
  }

  async executePerform () {
    const { name, members } = this.params
    const transaction = this.transaction

    const [team] = await Team.findOrCreate({ where: { name }, transaction })

    await TeamMembership.create({
      TeamId: team.id,
      UserId: this.performer.id,
      admin: true
    }, { transaction })

    await Promise.all(
      uniq(members.split(/[\s\n,]+/)).map(async email => {
        if (!email.trim()) {
          return
        }

        const [user] = await User.findOrCreate({
          where: { email: email.toLowerCase() },
          transaction
        })

        await TeamMembership.findOrCreate({ where: { TeamId: team.id, UserId: user.id }, transaction })
      })
    )

    return team
  }
}

export default CreateTeam
