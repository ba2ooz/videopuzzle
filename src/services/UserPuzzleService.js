export class UserPuzzleService {
  constructor(puzzleService, solvedPuzzleService, userService) {
    this.puzzleService = puzzleService;
    this.solvedPuzzleService = solvedPuzzleService;
    this.userService = userService;
  }

  async getUserPuzzles() {
    const userId = await this.userService.getOrCreateGuestUser();
    const allPuzzles = await this.puzzleService.getAllPuzzles();
    const solvedPuzzles =
      await this.solvedPuzzleService.getSolvedPuzzlesForUser(userId);

    const solvedSet = new Set(solvedPuzzles.map((puzzle) => puzzle.puzzle_id));

    const allPuzzlesMapped = allPuzzles.map((puzzle) => ({
      ...puzzle,
      isSolved: solvedSet.has(puzzle.id),
    }));

    return allPuzzlesMapped;
  }

  async saveSolvedPuzzleForUser(puzzleId, puzzleData) {
    const userId = await this.userService.getOrCreateGuestUser();
    const puzzleAlreadySolved = await this.solvedPuzzleService.getSolvedPuzzleForUser(
      userId,
      puzzleId
    );

    if (puzzleAlreadySolved) {
      const updatedPuzzle = {
        ...puzzleAlreadySolved,
        user_id: userId,
        moves: puzzleData.moves,
        time: puzzleData.time,
      };

      return await this.solvedPuzzleService.updateSolvedPuzzle(
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

    return await this.solvedPuzzleService.createSolvedPuzzle(newPuzzle);
  }
}
