import { catchError } from "../utils/utils";
import pb from "./PocketBaseClient";

export class UserService {
  constructor() {
    this.STORAGE_USER_KEY = "guestUser";
  }

  async getOrCreateGuestUser() {
    const storedUserId = localStorage.getItem(this.STORAGE_USER_KEY);
    const storedUser = await this.getUserById(storedUserId);
    if (storedUser) 
      return storedUserId;

    const guestUser = await this.createGuestUser();
    localStorage.setItem(this.STORAGE_USER_KEY, guestUser.id);

    return guestUser.id;
  }

  async createGuestUser() {
    const [error, guestUser] = await catchError(
      pb.collection("users").create(this.generateGuestUserRecord())
    );

    if (error) 
      throw new Error("Failed to create guest user");

    return guestUser;
  }

  async getUserById(userId) {
    if (!userId?.trim()) return null;

    const [error, user] = await catchError(
      pb.collection("users").getOne(userId.trim())
    );

    if (error) {
      if (error.response.status === 404) return null;

      throw new Error("Failed to fetch user");
    }

    return user;
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
