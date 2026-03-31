export function calculateElo(
    playerRating: number,
    opponentRating: number,
    score: number // 1.0 = win, 0.5 = draw, 0.0 = loss
): number {
    const K = 32;
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return Math.round(playerRating + K * (score - expected));
}
