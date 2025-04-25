import { UserRepository } from "../db/UserRepository";
import { NotFoundError } from "../errors/ServiceError";
import { catchError } from "../../utils";

export class UserService {
  /**
   * @param {UserRepository} userRepository 
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.STORAGE_USER_KEY = "guestUser";
  }

  async getOrCreateGuestUser() {
    const storedUserId = localStorage.getItem(this.STORAGE_USER_KEY);

    const [error, existingUser] = await catchError(
      this.userRepository.getUserById(storedUserId)
    );

    // If the user is not found, we can ignore the error
    // because we will create a new guest user
    if (error && !(error instanceof NotFoundError)) 
        throw error;

    if (existingUser) 
        return storedUserId;

    const guestUser = this.generateGuestUserRecord();
    const guestUserRecord = await this.userRepository.createGuestUser(guestUser);
    localStorage.setItem(this.STORAGE_USER_KEY, guestUserRecord.id);

    return guestUserRecord.id;
  }

  generateGuestUserRecord() {
    const guestUserPass = Date.now();
    return {
      email: `guest_user_${Date.now()}@videopuzzle.mock`,
      password: guestUserPass,
      passwordConfirm: guestUserPass,
    };
  }
}
