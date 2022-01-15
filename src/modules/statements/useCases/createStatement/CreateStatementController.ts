import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { user_id: user_recipient } = request.params;

    const splittedPath = request.originalUrl.split("/");

    const operationTransfer = splittedPath[splittedPath.length - 2].slice(0, 8);

    if (user_recipient) {
      const type = operationTransfer as OperationType;

      const createStatement = container.resolve(CreateStatementUseCase);

      const statement = await createStatement.execute({
        user_id,
        sender_id: user_id,
        recipient_id: user_recipient,
        type,
        amount,
        description,
      });

      return response.status(201).json(statement);
    } else {
      const type = splittedPath[splittedPath.length - 1] as OperationType;

      const createStatement = container.resolve(CreateStatementUseCase);

      const statement = await createStatement.execute({
        user_id,
        type,
        amount,
        description,
      });

      return response.status(201).json(statement);
    }
  }
}
