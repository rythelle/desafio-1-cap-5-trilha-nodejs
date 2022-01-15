import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({
    statement,
    balance,
  }: {
    statement: Statement[];
    balance: number;
  }) {
    const parsedStatement = statement.map(
      ({
        id,
        sender_id,
        amount,
        description,
        type,
        created_at,
        updated_at,
      }) => {
        if (sender_id === null) {
          return {
            id: id,
            amount: Number(amount),
            description: description,
            type: type,
            created_at: created_at,
            updated_at: updated_at,
          };
        } else {
          return {
            id: id,
            sender_id: sender_id,
            amount: Number(amount),
            description: description,
            type: type,
            created_at: created_at,
            updated_at: updated_at,
          };
        }
      }
    );

    return {
      statement: parsedStatement,
      balance: Number(balance),
    };
  }
}
