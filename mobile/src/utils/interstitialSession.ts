/**
 * Keeps interstitials "occasional" (Section 15) rather than showing one on
 * every single natural transition: at most once per app session, and only
 * right after leaving an active chat for home - never mid-conversation.
 * Plain module state is fine here; it only needs to survive for the life
 * of the JS instance, not across app restarts.
 */
let shownThisSession = false;
let pendingChatExit = false;

export function markChatExitPending() {
  pendingChatExit = true;
}

export function consumeChatExitInterstitialTrigger(): boolean {
  if (!pendingChatExit || shownThisSession) {
    pendingChatExit = false;
    return false;
  }
  pendingChatExit = false;
  return true;
}

export function markInterstitialShown() {
  shownThisSession = true;
}
