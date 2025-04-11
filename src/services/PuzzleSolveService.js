import { catchError } from "../utils/utils";
import pb from "./PocketBaseClient";

export class PuzzleSolveService {
  constructor() {}

  async getSolvedPuzzlesForUser(userId) {
    const [error, solvedPuzzles] = await catchError(
      pb.collection("puzzles_solved").getFullList({
        filter: `user_id="${userId}"`,
      })
    );

    if (error) {
      throw new Error("Failed to fetch solved puzzles");
    }

    return solvedPuzzles;
  }

  async getSolvedPuzzleForUser(userId, puzzleId) {
    const [error, solvedPuzzle] = await catchError(
      pb
        .collection("puzzles_solved")
        .getFirstListItem(`user_id="${userId}" && puzzle_id="${puzzleId}"`)
    );

    if (error) {
      if (error.status === 404) return null;

      throw new Error("Failed to fetch solved puzzle");
    }

    return solvedPuzzle;
  }

  async createSolvedPuzzle(data) {
    const [error, solvedPuzzle] = await catchError(
      pb.collection("puzzles_solved").create(data)
    );

    if (error) {
      throw new Error("Failed to create solved puzzle");
    }

    return solvedPuzzle;
  }

  async updateSolvedPuzzle(recordId, updatedData) {
    const [error, updatedSolvedPuzzle] = await catchError(
      pb.collection("puzzles_solved").update(recordId, updatedData)
    );

    if (error) {
      throw new Error("Failed to update solved puzzle");
    }

    return updatedSolvedPuzzle;
  }
}
