import { Team } from 'discord.js'
import { createServer } from 'http'
import { client } from '~'
import { PERMISSIONS } from '~commands'

export const server = createServer(async (request, resp) => {
  if (request.url !== '/stats') {
    resp.writeHead(404)
    resp.write('Not Found')

    return resp.end()
  }

  const app = await client.fetchApplication()
  const invite = await client.generateInvite({ permissions: PERMISSIONS })

  const owner =
    app.owner === null
      ? 'Unknown'
      : app.owner instanceof Team
      ? `${app.owner.name} (Team)`
      : app.owner.tag

  const data = {
    application: { owner, public: app.botPublic },
    clientID: app.id,
    guilds: client.guilds.cache.size,
    invite,
    uptime: client.uptime,
    username: client.user?.tag,
    users: client.users.cache.size,
  }

  resp.write(JSON.stringify(data))
  resp.write('\n')

  return resp.end()
})
