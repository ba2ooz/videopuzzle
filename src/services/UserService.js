import { interceptErrors } from "./errors/middleware/ErrorInterceptorDecorator";
import { NotFoundError } from "./errors/ServiceError";
import { catchError } from "../utils/utils";
import pb from "./PocketBaseClient";

export class UserService {
  constructor() {
    this.STORAGE_USER_KEY = "guestUser";
  }

  async getOrCreateGuestUser() {
    const storedUserId = localStorage.getItem(this.STORAGE_USER_KEY);
    
    const [error, existingUser] = await catchError(this.getUserById(storedUserId));
    
    // If the user is not found, we can ignore the error
    // because we will create a new guest user
    if (error && !(error instanceof NotFoundError)) 
      throw error;

    if (existingUser) 
      return storedUserId;

    const guestUser = await this.createGuestUser();
    localStorage.setItem(this.STORAGE_USER_KEY, guestUser.id);

    return guestUser.id;
  }

  @interceptErrors
  async createGuestUser() {
    return await pb.collection("users").create(this.generateGuestUserRecord())
  }

  @interceptErrors
  async getUserById(userId) {
    if (!userId?.trim()) return null;

    return await pb.collection("users").getOne(userId.trim())
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
