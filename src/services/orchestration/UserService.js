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
    this.cachedUser = null;
  }

  async getUser() {
    if (this.cachedUser) 
        return UserDto.parse(this.cachedUser);

    // get user from local storage
    const storedUserJson = localStorage.getItem(this.STORAGE_USER_KEY);
    const storedUser = UserDto.parse(storedUserJson);
    if (!storedUser?.id?.trim()) 
        return null;

    // make sure user exists in the database
    const [error, user] = await catchError(this.userRepository.getUserById(storedUser.id.trim()));
    if (error) {
      if (error instanceof NotFoundError) 
        return null;

      throw error;
    }

    return user;
  }

  async getOrCreateGuestUser() {
    //get local user
    const storedUserJson = await this.getUser();
    if (storedUserJson) {
      return storedUserJson; 
    }

    // no cached user, create new guest user
    const guestUser = this.generateGuestUserRecord();
    const guestUserRecord = await this.userRepository.createGuestUser(guestUser);
    this.updateCachedUser(guestUserRecord);

    return guestUserRecord; 
  }

  updateCachedUser(userObj) {
    const userJson = UserDto.stringify(userObj);
    localStorage.setItem(this.STORAGE_USER_KEY, userJson);
    this.cachedUser = userJson;
  }

  async saveUserTutorial() {
    const user = await this.getUser();
    const updatedUser = await this.userRepository.updateUser(user.id, { tutorialCompleted: true });
    this.updateCachedUser(updatedUser);
    
    return updatedUser;
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

class UserDto {
  static normalize(obj) {
    return {
      id: obj?.id ?? null,
      tutorialCompleted: obj?.tutorialCompleted ?? null,
    };
  }

  static stringify(obj) {
    return JSON.stringify(UserDto.normalize(obj));
  }

  static parse(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return UserDto.normalize(parsed);
    } catch {
      return null; 
    }
  }
}