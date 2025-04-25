import { interceptErrors } from "../errors/middleware/ErrorInterceptorDecorator";
import pb from "./PocketBaseClient";

export class UserRepository {
  @interceptErrors
  async createGuestUser(user) {
    return await pb.collection("users").create(user);
  }

  @interceptErrors
  async getUserById(userId) {
    if (!userId?.trim()) 
      return null;

    return await pb.collection("users").getOne(userId.trim())
  }
}
