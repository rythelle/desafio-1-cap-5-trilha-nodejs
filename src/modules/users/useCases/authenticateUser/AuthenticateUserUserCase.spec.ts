import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });
  it("should be able to authenticate a user", async () => {
    const user = {
      name: "John",
      email: "john@gmail.com",
      password: "123456",
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to do authentication if password is wrong", async () => {
    await expect(async () => {
      const user = {
        name: "John",
        email: "john@gmail.com",
        password: "123456",
      };

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "0000",
      });
    }).rejects.toEqual(new AppError("Incorrect email or password", 401));
  });

  it("should not be able to do authentication if email is wrong", async () => {
    await expect(async () => {
      const user = {
        name: "John",
        email: "john@gmail.com",
        password: "123456",
      };

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });

      await authenticateUserUseCase.execute({
        email: "Pedro",
        password: user.password,
      });
    }).rejects.toEqual(new AppError("Incorrect email or password", 401));
  });
});
