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
    this.cachedUserId = null;
  }

  async getOrCreateGuestUser() {
    const storedUserId = await this.getUser();
    if (storedUserId) 
        return storedUserId;

    const guestUser = this.generateGuestUserRecord();
    const guestUserRecord = await this.userRepository.createGuestUser(guestUser);
    localStorage.setItem(this.STORAGE_USER_KEY, guestUserRecord.id);

    return guestUserRecord.id;
  }

  async getUser() {
    if (this.cachedUserId) 
        return this.cachedUserId;

    const storedUserId = localStorage.getItem(this.STORAGE_USER_KEY);
    if (!storedUserId) 
        return null;

    const [error, user] = await catchError(
      this.userRepository.getUserById(storedUserId)
    );

    if (error) {
      if (error instanceof NotFoundError) 
        return null;

      throw error;
    }

    this.cachedUserId = user.id;
    return user.id;
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
