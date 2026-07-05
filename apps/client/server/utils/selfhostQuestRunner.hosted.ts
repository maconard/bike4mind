/**
 * Hosted-build stub for the self-host quest runner (see next.config.mjs).
 * Aliasing to this keeps the quest-processing chain out of the Next server
 * bundle, which must stay under the Lambda unzipped-size cap. Never called:
 * the dispatchQuest self-host branch is gated on B4M_SELF_HOST.
 */
export function runQuestSelfHost(_params: unknown, _logger: unknown): void {
  throw new Error('Self-host quest runner is not part of this build');
}
