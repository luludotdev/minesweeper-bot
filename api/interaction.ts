/* eslint-disable import/extensions */
import { type VercelRequest, type VercelResponse } from '@vercel/node'
import {
  type APIChatInputApplicationCommandInteraction,
  type APIMessageInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/payloads/v9'
import { verifyKey } from 'discord-interactions'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import nc from 'next-connect'
import { env } from 'node:process'
import getRawBody from 'raw-body'
import { getDifficulty, isDifficulty } from './_lib/difficulty'
import { minesweeper } from './_lib/minesweeper'

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
  } else if (message.type === InteractionType.ApplicationCommand) {
    const interaction =
      message as unknown as APIChatInputApplicationCommandInteraction

    switch (interaction.data.name) {
      case 'testsweeper':
      case 'minesweeper': {
        const options = interaction.data.options ?? []
        const difficultyOption = options.find(
          x => x.name === 'difficulty'
        ) as unknown as Record<string, string> | undefined
        const difficulty = difficultyOption?.value ?? 'normal'

        if (!isDifficulty(difficulty)) {
          response
            .status(StatusCodes.BAD_REQUEST)
            .send(ReasonPhrases.BAD_REQUEST)

          return
        }

        const [width, height, bombs] = getDifficulty(difficulty)
        const board = minesweeper(width, height, bombs)

        response.status(200).send({
          type: InteractionResponseType.ChannelMessageWithSource,
          data: { content: board },
        })

        break
      }

      default: {
        response.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND)
        break
      }
    }
  } else {
    response.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST)
  }
})

export default handler
