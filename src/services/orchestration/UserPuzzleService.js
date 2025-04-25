import { SolvedPuzzleRepository } from "../db/SolvedPuzzleRepository";
import { PuzzleRepository } from "../db/PuzzleRepository";
import { UserService } from "./UserService";
import { NotFoundError } from "../errors/ServiceError";
import { catchError } from "../../utils";

export class UserPuzzleService {
  /**
   * @param {SolvedPuzzleRepository} solvedPuzzleRepository 
   * @param {PuzzleRepository} puzzleRepository 
   * @param {UserService} userService 
   * 
   */
  constructor(solvedPuzzleRepository, puzzleRepository, userService) {
    this.solvedPuzzleRepository = solvedPuzzleRepository;
    this.puzzleRepository = puzzleRepository;
    this.userService = userService;
  }

  async getUserPuzzles() {
    const userId = await this.userService.getOrCreateGuestUser();
    const allPuzzles = await this.puzzleRepository.getAllPuzzles();
    const solvedPuzzles =
      await this.solvedPuzzleRepository.getSolvedPuzzles(userId);

    const solvedSet = new Set(solvedPuzzles.map((puzzle) => puzzle.puzzle_id));

    const allPuzzlesMapped = allPuzzles.map((puzzle) => ({
      ...puzzle,
      isSolved: solvedSet.has(puzzle.id),
    }));

    return allPuzzlesMapped;
  }

  async getUserPuzzle(puzzleId) {
    const userId = await this.userService.getOrCreateGuestUser();
    const puzzle = await this.puzzleRepository.getPuzzleById(puzzleId);
    const [error, puzzleSolved] = await catchError(
      this.solvedPuzzleRepository.getSolvedPuzzle(userId, puzzleId)
    );

    // ignore puzzle not found error
    if (error && !(error instanceof NotFoundError)) 
      throw error;

    if (!puzzleSolved) {
      return { 
        ...puzzle,
        isSolved: false 
      };
    }

    const ranks = await this.solvedPuzzleRepository.getSolvedPuzzleRank(userId, puzzleId);

    return { 
      ...puzzle, 
      isSolved: true,
      stats: {
        moves: puzzleSolved.moves,
        time: puzzleSolved.time,
        movesRank: ranks.movesRank, 
        timeRank: ranks.timeRank, 
      }
    };
  }

  async saveUserPuzzle(puzzleId, puzzleData) {
    const userId = await this.userService.getOrCreateGuestUser();
    
    const [error, puzzleAlreadySolved] = await catchError(
      this.solvedPuzzleRepository.getSolvedPuzzle(userId, puzzleId)
    );

    // If the puzzle is not found, we ignore the error
    // because we will create a new solved puzzle
    if (error && !(error instanceof NotFoundError)) 
      throw error;

    if (puzzleAlreadySolved) {
      const updatedPuzzle = {
        ...puzzleAlreadySolved,
        user_id: userId,
        moves: puzzleData.moves,
        time: puzzleData.time,
      };

      return await this.solvedPuzzleRepository.updateSolvedPuzzle(
        puzzleAlreadySolved.id,
        updatedPuzzle
      );
    }

    const newPuzzle = {
      user_id: userId,
      puzzle_id: puzzleId,
      moves: puzzleData.moves,
      time: puzzleData.time,
    };

    return await this.solvedPuzzleRepository.createSolvedPuzzle(newPuzzle);
  }
}
