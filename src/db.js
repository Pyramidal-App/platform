import { readFileSync } from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import cls from 'continuation-local-storage'

import allConfig from '../db/config'

// Allows automatic passing transaction
Sequelize.useCLS(cls.createNamespace('pyramidal_platform'))

const env = process.env.NODE_ENV || 'development'
const config = allConfig[env]

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

export { Sequelize, sequelize }
