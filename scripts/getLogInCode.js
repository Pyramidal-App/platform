import readline from 'readline'

import { User } from '../src/models'
import AuthService from '../src/AuthService'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const main = async _ => {
  rl.question('Do you want an user in particular? Type the email then: ', async email => {
    const user = await User.findOne({ where: { email }})
    const token = AuthService.generateToken(user)

    console.log('Run this on your console:')
    console.log(`> logIn(${JSON.stringify(user)}, ${JSON.stringify(token)})`)

    rl.close()
  })
}

main()
