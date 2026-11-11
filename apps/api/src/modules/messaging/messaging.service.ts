import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class MessagingService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // TODO [F13]: findConversations(userId)
  // TODO [F13]: findMessages(conversationId, userId)
  // TODO [F13]: createConversation(listingId, initiatorId, recipientId)
  // TODO [F13]: sendMessage(conversationId, senderId, body)
}
