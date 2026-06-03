export type CardStatus = 'pending' | 'processing' | 'completed' | 'failed'

export function isTerminalCardStatus(status: string | null | undefined): status is 'completed' | 'failed' {
  return status === 'completed' || status === 'failed'
}

export function getCardStatusPollingDelay(elapsedMs: number): number {
  if (elapsedMs < 5000) return 1000
  if (elapsedMs < 30000) return 3000
  return 5000
}

export function getRetryAfterSeconds(elapsedMs: number): number {
  return Math.ceil(getCardStatusPollingDelay(elapsedMs) / 1000)
}
