import type { z } from 'zod';
import type { QuestStartBodySchema } from '@bike4mind/services';
import type { Logger } from '@bike4mind/observability';
import { questRepository } from '@bike4mind/database';
import { processQuest } from '@server/queueHandlers/questProcessor';

type QuestStartBody = z.infer<typeof QuestStartBodySchema>;

/**
 * Self-host quest runner: processes the quest in this container instead of the
 * separate quest-processor service. Only the self-host build resolves this
 * module; hosted builds alias it to selfhostQuestRunner.hosted.ts (see
 * next.config.mjs) so the quest-processing chain stays out of the Lambda bundle.
 *
 * Fire-and-forget mirrors the service's 202-then-process contract; a failure
 * marks the quest stopped so it never hangs in 'running'.
 */
export function runQuestSelfHost(params: QuestStartBody, logger: Logger): void {
  void processQuest(params, logger).catch(async (err: unknown) => {
    logger.error('Quest processing failed', { error: err instanceof Error ? err.message : String(err) });
    try {
      await questRepository.update({
        id: params.questId,
        status: 'stopped',
        replies: ['Something went wrong while processing your request. Please try again.'],
      });
    } catch (updateErr) {
      logger.error('Failed to mark quest stopped after processing error', {
        error: updateErr instanceof Error ? updateErr.message : String(updateErr),
      });
    }
  });
}
