import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance", async () => {
    const user = {
      name: "John",
      email: "john@gmail.com",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const deposit = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: "deposit" as OperationType,
      amount: 100.5,
      description: "Food",
    });

    await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: "withdraw" as OperationType,
      amount: 50.5,
      description: "Gas",
    });

    const balance = await getBalanceUseCase.execute({
      user_id: userCreated.id as string,
    });
    expect(balance.balance).toEqual(50);
  });

  it("should not be able to get a user balance that doesn't exist", async () => {
    await expect(async () => {
      const user = {
        name: "John",
        email: "john@gmail.com",
        password: "123456",
      };

      const userCreated = await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        type: "deposit" as OperationType,
        amount: 100.5,
        description: "Food",
      });

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        type: "withdraw" as OperationType,
        amount: 50.5,
        description: "Gas",
      });

      await getBalanceUseCase.execute({
        user_id: "Testing" as string,
      });
    }).rejects.toEqual(new AppError("User not found", 404));
  });
});
