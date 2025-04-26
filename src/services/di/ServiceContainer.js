import { SolvedPuzzleRepository } from "../db/SolvedPuzzleRepository";
import { PuzzleRepository } from "../db/PuzzleRepository";
import { UserRepository } from "../db/UserRepository";

import { UserPuzzleService } from "../orchestration/UserPuzzleService";
import { UserService } from "../orchestration/UserService";


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
    const solvedPuzzleRepository = new SolvedPuzzleRepository();
    const puzzleRepository = new PuzzleRepository();
    const userRepository = new UserRepository();
    const userService = new UserService(userRepository);
    const userPuzzleService = new UserPuzzleService(solvedPuzzleRepository, puzzleRepository, userService);

    this.set("puzzleSolveRepository", solvedPuzzleRepository);
    this.set("puzzleRepository", puzzleRepository);
    this.set("userRepository", userRepository);
    this.set("userService", userService);
    this.set("userPuzzleService", userPuzzleService);
  }
}