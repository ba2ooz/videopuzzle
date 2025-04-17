import { PuzzleSolveService } from "./PuzzleSolveService.js";
import { UserPuzzleService } from "./UserPuzzleService.js";
import { PuzzleService } from "./PuzzleService.js";
import { UserService } from "./UserService.js";
import { RankService } from "./RankService.js";


export class ServiceContainer {
  constructor() {
    this._instances = new Map();
  }

  get(name) {
    return this._instances.get(name);
  }

  set(name, instance) {
    this._instances.set(name, instance);
  }

  initialize() {
    const puzzleService = new PuzzleService();
    const userService = new UserService();
    const puzzleSolveService = new PuzzleSolveService();
    const rankService = new RankService();
    const userPuzzleService = new UserPuzzleService(puzzleService, puzzleSolveService, userService, rankService);

    this.set("puzzleService", puzzleService);
    this.set("userService", userService);
    this.set("puzzleSolveService", puzzleSolveService);
    this.set("rankService", rankService);
    this.set("userPuzzleService", userPuzzleService);
  }
}