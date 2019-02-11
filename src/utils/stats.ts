import { createServer } from 'http'
import { client, PERMISSIONS } from '..'

// Create the stats server
export const server = createServer(async (req, res) => {
  if (req.url !== '/stats') {
    res.writeHead(404)
    res.write('Not Found')
    return res.end()
  }

  const application = await client.fetchApplication()
  const invite = await client.generateInvite(PERMISSIONS)

  const data = {
    application: {
      owner: application.owner && application.owner.tag,
      public: application.botPublic,
    },
    clientID: application.id,
    guilds: client.guilds.size,
    invite,
    uptime: client.uptime,
    username: client.user && client.user.tag,
    users: client.users.size,
  }

  res.write(JSON.stringify(data))
  res.write('\n')
  return res.end()
})
