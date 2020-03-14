import { OAuth2Client } from 'google-auth-library'

import BusinessAction from '../BusinessAction'
import { User } from '../models'
import AuthService from '../AuthService'

const GOOGLE_OAUTH_KEY = process.env.GOOGLE_OAUTH_KEY
const GOOGLE_OAUTH_SECRET = process.env.GOOGLE_OAUTH_SECRET
const HOST = process.env.FRONT_HOST || 'localhost:8080'

const findOrCreateUser = async ({ email, name, avatarUrl }) => {
  const existingUser = await User.findOne({ email })

  if (existingUser) {
    existingUser.name = name
    existingUser.googleAvatarUrl = avatarUrl

    await existingUser.save()

    return existingUser
  } else {
    return await User.create({ email, name, googleAvatarUrl: avatarUrl })
  }
}

class LoginWithGoogle extends BusinessAction {
  runPerformWithinTransaction = true

  async executePerform () {
    const { accessToken, idToken } = this.params

    const oAuth2Client = new OAuth2Client(
      GOOGLE_OAUTH_KEY,
      GOOGLE_OAUTH_SECRET,
      HOST
    )

    oAuth2Client.setCredentials({
      token_type: 'Bearer',
      access_token: accessToken,
      id_token: idToken
    })

    const result = await oAuth2Client.request({
      url:
        'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos'
    })

    const {
      data: {
        names: [{ displayName: name }],
        emailAddresses: [{ value: email }],
        photos: [{ url: avatarUrl }]
      }
    } = result

    const user = await findOrCreateUser({ email, name, avatarUrl })
    const token = AuthService.generateToken(user)

    return { token, user }
  }
}

export default LoginWithGoogle
