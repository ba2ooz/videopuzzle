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
}
