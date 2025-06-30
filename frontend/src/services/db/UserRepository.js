import { interceptErrors } from "../errors/middleware/ErrorInterceptorDecorator";
import pb from "./PocketBaseClient";

export class UserRepository {
  @interceptErrors
  async createGuestUser(user) {
    return await pb.collection("users").create(user);
  }

  @interceptErrors
  async getUserById(userId) {
    return await pb.collection("users").getOne(userId)
  }

  @interceptErrors
  async updateUser(userId, data) {
    return await pb.collection("users").update(userId, data);
  }
}
