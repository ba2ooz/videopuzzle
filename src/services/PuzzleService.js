import { catchError } from "../utils/utils";
import pb from "./PocketBaseClient";

export class PuzzleService {
  constructor() {}

  // Get all puzzles
  async getAllPuzzles() {
    const [error, puzzles] = await catchError(pb.collection('puzzles').getFullList());
    if (error) {
      throw new Error("Failed to fetch puzzles");
    }

    return puzzles;
  }

  // Get puzzle by ID
  async getPuzzleById(id) {
    const [error, puzzle] = await catchError(pb.collection('puzzles').getOne(id));
    if (error) {
      throw new Error("Failed to fetch puzzle");
    }

    return puzzle;
  }
}
