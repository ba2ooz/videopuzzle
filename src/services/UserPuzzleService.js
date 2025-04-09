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
}
