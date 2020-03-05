import jwt from 'jsonwebtoken'
import User from './models/User'

const SECRET = process.env.SECRET || 'development_secret'

const AuthService = {
  generateToken: user => jwt.sign({ userId: user.id }, SECRET),

  getUser: async token => {
    jwt.verify(token, SECRET)
    const { userId } = jwt.decode(token, SECRET)
    return await User.findByPk(userId)
  }
}

export default AuthService
