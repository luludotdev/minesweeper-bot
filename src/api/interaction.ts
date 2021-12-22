import { type VercelRequest, type VercelResponse } from '@vercel/node'
import {
  type APIMessageInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/payloads/v9'
import { verifyKey } from 'discord-interactions'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import nc from 'next-connect'
import { env } from 'node:process'
import getRawBody from 'raw-body'

const extractHeader: (
  header: string | string[] | undefined
) => string | undefined = header => (Array.isArray(header) ? header[0] : header)

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
  const publicKey = env.PUBLIC_KEY
  if (!publicKey) {
    throw new Error('missing PUBLIC_KEY env var')
  }

  const isValid = verifyKey(rawBody, signature, timestamp, publicKey)
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
