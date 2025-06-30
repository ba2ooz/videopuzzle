import { interceptErrors } from "../errors/middleware/ErrorInterceptorDecorator";
import pb from "./PocketBaseClient";

export class PuzzleRepository {
  @interceptErrors
  async getAllPuzzles() {
    return await pb.collection('puzzles').getFullList();
  }

  @interceptErrors
  async getPuzzleById(id) {
    return await pb.collection('puzzles').getOne(id);
  }
}
