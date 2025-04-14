import { interceptErrors } from "./errors/middleware/ErrorInterceptorDecorator";
import pb from "./PocketBaseClient";

export class PuzzleSolveService {
  constructor() {}

  @interceptErrors
  async getSolvedPuzzlesForUser(userId) {
    return await pb.collection("puzzles_solved").getFullList({
      filter: `user_id="${userId}"`,
    });
  }

  @interceptErrors
  async getSolvedPuzzleForUser(userId, puzzleId) {
    return await pb
      .collection("puzzles_solved")
      .getFirstListItem(`user_id="${userId}" && puzzle_id="${puzzleId}"`);
  }

  @interceptErrors
  async createSolvedPuzzle(data) {
    return await pb.collection("puzzles_solved").create(data);
  }

  @interceptErrors
  async updateSolvedPuzzle(recordId, updatedData) {
    return await pb.collection("puzzles_solved").update(recordId, updatedData);
  }
}
