/**
 * Client for the local ESC/POS print agent (see `print-agent/` at the repo root).
 *
 * The agent runs on the kiosk PC and sends receipts straight to the thermal printer as ESC/POS
 * bytes. That bypasses Chrome's print pipeline entirely -- the pipeline that rasterizes each
 * 80mm receipt into a full-page image and wedges after a handful of kiosk jobs.
 *
 * When the agent is unreachable the caller falls back to browser printing (ThermalPrintUtils),
 * so a stopped helper process degrades the kiosk rather than disabling it.
 */

const AGENT_URL = 'http://127.0.0.1:9101'

/** A hung agent must never hold up the counter, so every call is bounded. */
const HEALTH_TIMEOUT_MS = 1500
const PRINT_TIMEOUT_MS = 5000

export type AgentResult = {
  ok: boolean
  /** Condition that stopped the print, e.g. 'out of paper'. Empty when it printed. */
  blocking?: string
  /** Worth telling the operator, but not a failure. */
  advisory?: string
  printer?: string
  jobs?: number
  error?: string
}

export default class ReceiptAgentUtils {
  private healthy: boolean | null = null

  private request = async (path: string, init: RequestInit, timeoutMs: number): Promise<any> => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(`${AGENT_URL}${path}`, {...init, signal: controller.signal})
      return await res.json()
    } finally {
      window.clearTimeout(timer)
    }
  }

  /** Is the agent installed and running? Cached after the first successful probe. */
  public probe = async (): Promise<boolean> => {
    try {
      const res = await this.request('/health', {method: 'GET'}, HEALTH_TIMEOUT_MS)
      this.healthy = !!res?.ok
    } catch (e) {
      this.healthy = false
    }
    return this.healthy
  }

  /** null until probed. */
  public isHealthy = () => this.healthy

  /**
   * Print a receipt. Rejects only when the agent itself could not be reached -- that is the
   * caller's signal to fall back to browser printing. A printer problem (out of paper, cover
   * open) resolves with `ok: false` instead, since falling back would not help.
   */
  public print = async (payload: any): Promise<AgentResult> => {
    const res = await this.request(
      '/print',
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      },
      PRINT_TIMEOUT_MS
    )
    this.healthy = true
    return res as AgentResult
  }
}
