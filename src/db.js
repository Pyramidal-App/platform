import { readFileSync } from 'fs'
import path from 'path'
import Sequelize from 'sequelize'

import allConfig from '../db/config'

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env]

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

export { Sequelize, sequelize }
