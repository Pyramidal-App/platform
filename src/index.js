import 'regenerator-runtime/runtime'
import Server from './Server'

const PORT = process.env.port || 4000

const start = async _ => {
  const { url } = await Server.listen(PORT)
  console.log(`🚀 Server ready at ${url}`)
}

start()
