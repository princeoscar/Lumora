export function getMatchChannelName(matchId: string) {
  return `private-match-${matchId}`;
}

export function getMatchPresenceChannelName(matchId: string) {
  return `presence-match-${matchId}`;
}

export function getUserChannelName(userId: string) {
  return `private-user-${userId}`;
}
