export function rewardStars(amount: number) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('abc:star', { detail: amount }))
}