import nc from 'next-connect'
import getRawBody from 'raw-body'
import { verifyKey } from 'discord-interactions'
import { type VercelRequest, type VercelResponse } from '@vercel/node'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { InteractionResponseType, InteractionType, type APIMessageInteraction } from 'discord-api-types/payloads/v9'

const extractHeader: (header: string | string[] | undefined) => string | undefined = header => Array.isArray(header) ? header[0] : header

const handler = nc<VercelRequest, VercelResponse>()
handler.post(async (request, response) => {
  const signature = extractHeader(request.headers['x-signature-ed25519'])
  if (!signature) {
    response.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN)
    return
  }

  const timestamp = extractHeader(request.headers['x-signature-timestamp'])
  if (!timestamp) {
    response.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN)
    return
  }

  const rawBody = await getRawBody(request)
  const isValid = verifyKey(
    rawBody,
    signature,
    timestamp,
    process.env.PUBLIC_KEY!
  )

  if (!isValid) {
    response.status(StatusCodes.FORBIDDEN).send(ReasonPhrases.FORBIDDEN)
    return
  }

  const message = request.body as APIMessageInteraction
  if (message.type === InteractionType.Ping) {
    response.send({ type: InteractionResponseType.Pong })
  }
})

export default handler
