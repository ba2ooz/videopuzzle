import { interceptErrors } from "./errors/middleware/ErrorInterceptorDecorator";
import pb from "./PocketBaseClient";

export class PuzzleService {
  constructor() {}

  @interceptErrors
  async getAllPuzzles() {
    return await pb.collection('puzzles').getFullList();
  }

  @interceptErrors
  async getPuzzleById(id) {
    return await pb.collection('puzzles').getOne(id);
  }
}
