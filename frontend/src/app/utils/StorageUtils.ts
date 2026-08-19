/**
 * Small JSON wrapper over sessionStorage, for state that must survive a page reload but must
 * not outlive the tab.
 *
 * `services/storage.service.ts` is auth-only and uses localStorage; this is deliberately
 * separate. Note `hooks/window/useWindowStorageEvent.tsx` force-reloads the app when the
 * `refreshToken` key changes, so keys here must never collide with it.
 */
export default class StorageUtils {
  private available = (): boolean => {
    try {
      return typeof window !== 'undefined' && !!window.sessionStorage
    } catch (e) {
      // sessionStorage access throws outright when cookies/site data are blocked
      return false
    }
  }

  public set = (key: string, value: any): void => {
    if (!this.available()) {
      return
    }
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // quota exceeded or serialization failure -- the caller treats storage as best-effort
    }
  }

  public get = <T = any>(key: string): T | null => {
    if (!this.available()) {
      return null
    }
    try {
      const raw = window.sessionStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch (e) {
      return null
    }
  }

  public remove = (key: string): void => {
    if (!this.available()) {
      return
    }
    try {
      window.sessionStorage.removeItem(key)
    } catch (e) {
      // nothing useful to do
    }
  }

  /**
   * Read a value written no longer than `maxAgeMs` ago, then drop it. Used for hand-off across a
   * reload: a stale entry from an earlier service must never be resurrected by a later reload.
   */
  public takeFresh = <T = any>(key: string, maxAgeMs: number): T | null => {
    const stored: any = this.get(key)
    this.remove(key)
    if (!stored || typeof stored.savedAt !== 'number') {
      return null
    }
    if (Date.now() - stored.savedAt > maxAgeMs) {
      return null
    }
    return stored as T
  }
}
