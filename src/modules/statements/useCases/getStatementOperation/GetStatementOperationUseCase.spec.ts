import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Statements", () => {
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

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to query deposit or withdraw transaction", async () => {
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

    const statement = {
      type: "deposit",
      amount: 100.5,
      description: "Food",
    };

    const deposit = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: statement.type as OperationType,
      amount: statement.amount,
      description: statement.description,
    });

    const operation = await getStatementOperationUseCase.execute({
      user_id: userCreated.id as string,
      statement_id: deposit.id as string,
    });

    expect(operation.amount).toEqual(100.5);
  });

  it("should not be able to query user deposit or withdrawal transaction that doesn't exist", async () => {
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

      const statement = {
        type: "deposit",
        amount: 100.5,
        description: "Food",
      };

      const deposit = await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        type: statement.type as OperationType,
        amount: statement.amount,
        description: statement.description,
      });

      await getStatementOperationUseCase.execute({
        user_id: "Testing",
        statement_id: deposit.id as string,
      });
    }).rejects.toEqual(new AppError("User not found", 404));
  });

  it("should not be able to query statement deposit or withdrawal transaction that doesn't exist", async () => {
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

      const statement = {
        type: "deposit",
        amount: 100.5,
        description: "Food",
      };

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        type: statement.type as OperationType,
        amount: statement.amount,
        description: statement.description,
      });

      await getStatementOperationUseCase.execute({
        user_id: userCreated.id as string,
        statement_id: "Testing",
      });
    }).rejects.toEqual(new AppError("Statement not found", 404));
  });
});
