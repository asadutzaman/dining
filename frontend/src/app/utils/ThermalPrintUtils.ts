/**
 * Serialized printing for the kiosk receipt printer.
 *
 * Chrome's print coordinator is scoped to the whole tab, not to each iframe: while it believes
 * a print is still in flight it silently ignores new print requests -- no error, no dialog,
 * window.print() simply does nothing. And print() is async, returning long before the job has
 * finished spooling.
 *
 * So a print source must never be destroyed or overwritten while its job is still running, and
 * two jobs must never overlap. Earlier revisions of the token receipt did both (a reused iframe
 * rewritten mid-job, then a fresh iframe torn down 1s after print()), which wedged the tab's
 * print path after ~5-6 receipts until the page was reloaded.
 *
 * This queue therefore runs exactly one job at a time and waits for real completion -- afterprint,
 * or a generous timeout -- before cleaning up and starting the next.
 */

/** How long to wait for `afterprint` before assuming the job is never going to report back. */
const JOB_TIMEOUT_MS = 10000

/** Let the frame settle before printing; srcdoc load alone doesn't guarantee layout is done. */
const RENDER_SETTLE_MS = 150

/** Keep the frame around briefly after completion so the spooler is well clear of it. */
const REMOVE_DELAY_MS = 500

/** Consecutive timeouts before we treat the print pipeline as stalled and tell the operator. */
const STALL_THRESHOLD = 2

type PrintJob = {
  html: string
  onDone?: () => void
}

export default class ThermalPrintUtils {
  private queue: PrintJob[] = []

  private running = false

  private consecutiveTimeouts = 0

  private onStall: (() => void) | null = null

  /**
   * Called when the pipeline looks stalled (repeated jobs finishing without `afterprint`).
   * Receipts fail silently otherwise: the record is saved but no paper comes out, and nobody
   * notices until someone complains.
   */
  public setStallHandler = (handler: (() => void) | null) => {
    this.onStall = handler
  }

  /**
   * Queue a document for printing. Returns immediately; jobs print in order, one at a time.
   * `onDone` fires when the job has genuinely finished (afterprint, or the fallback timeout) --
   * never before, since tearing the page down mid-job is what wedges Chrome's print path.
   */
  public print = (html: string, onDone?: () => void) => {
    this.queue.push({html, onDone})
    this.pump()
  }

  /** True when nothing is printing and nothing is waiting to print. */
  public isIdle = () => !this.running && this.queue.length === 0

  private pump = () => {
    if (this.running) {
      return
    }
    const job = this.queue.shift()
    if (!job) {
      return
    }
    this.running = true
    this.runJob(job)
  }

  private finish = (job: PrintJob, timedOut: boolean) => {
    if (timedOut) {
      this.consecutiveTimeouts += 1
      if (this.consecutiveTimeouts === STALL_THRESHOLD) {
        this.onStall?.()
      }
    } else {
      this.consecutiveTimeouts = 0
    }
    this.running = false
    // Start the next job before notifying: onDone may reload the page, and it checks isIdle()
    // to decide whether it is safe to do so. Pumping first keeps that answer truthful.
    this.pump()
    try {
      job.onDone?.()
    } catch (e) {
      // a bad callback must not stall the queue
    }
  }

  private runJob = (job: PrintJob) => {
    let frame: HTMLIFrameElement
    try {
      // A hidden iframe (rather than window.open) isn't subject to popup blocking, which matters
      // because this runs async after the scan/API calls rather than inside a user gesture.
      frame = document.createElement('iframe')
      frame.setAttribute('aria-hidden', 'true')
      frame.style.position = 'fixed'
      frame.style.width = '0'
      frame.style.height = '0'
      frame.style.border = '0'
      document.body.appendChild(frame)
    } catch (e) {
      this.finish(job, false)
      return
    }

    let settled = false

    // Whichever signal arrives first wins; the loser is ignored. The frame is removed only once
    // the job is genuinely over, never while it may still be spooling.
    const settle = (timedOut: boolean) => {
      if (settled) {
        return
      }
      settled = true
      window.clearTimeout(timeoutId)
      window.setTimeout(() => {
        try {
          frame.parentNode?.removeChild(frame)
        } catch (e) {
          // the frame is already gone; nothing to do
        }
        this.finish(job, timedOut)
      }, REMOVE_DELAY_MS)
    }

    const timeoutId = window.setTimeout(() => settle(true), JOB_TIMEOUT_MS)

    frame.onload = () => {
      const frameWindow = frame.contentWindow
      if (!frameWindow) {
        settle(false)
        return
      }
      // No frameWindow.focus() here: printing doesn't need it, and pulling focus into a hidden
      // iframe steals it from the card-scan input the operator is about to scan into.
      frameWindow.onafterprint = () => settle(false)
      window.setTimeout(() => {
        try {
          frameWindow.print()
        } catch (e) {
          settle(false)
        }
      }, RENDER_SETTLE_MS)
    }

    frame.srcdoc = job.html
  }
}
