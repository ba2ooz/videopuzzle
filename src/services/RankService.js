import { interceptErrors } from "./errors/middleware/ErrorInterceptorDecorator";
import pb from "./PocketBaseClient";

export class RankService {
  @interceptErrors
  async getPuzzleRankForUser(userId, puzzleId) {
    return await pb
      .collection("ranked_stats")
      .getFirstListItem(`user_id="${userId}" && puzzle_id="${puzzleId}"`);
  }
}
