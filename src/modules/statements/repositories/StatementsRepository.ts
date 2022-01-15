import { getRepository, ObjectType, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    recipient_id,
    amount,
    description,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    if (type === "transfer") {
      const withdraw = this.repository.create({
        user_id,
        recipient_id: recipient_id,
        amount,
        description,
        type: "withdraw" as OperationType,
      });

      this.repository.save(withdraw);

      const deposit = this.repository.create({
        user_id: recipient_id,
        sender_id: user_id,
        amount,
        description,
        type,
      });

      return this.repository.save(deposit);
    } else {
      const statement = this.repository.create({
        user_id,
        amount,
        description,
        type,
      });

      return this.repository.save(statement);
    }
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = await this.repository.find({
      where: { user_id },
    });

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === "deposit") {
        return acc + Number(operation.amount);
      } else if (operation.type === "transfer") {
        if (operation.sender_id != null) {
          return acc + Number(operation.amount);
        } else {
          return acc - Number(operation.amount);
        }
      } else {
        return acc - Number(operation.amount);
      }
    }, 0);

    if (with_statement) {
      return {
        statement,
        balance,
      };
    }

    return { balance };
  }
}
