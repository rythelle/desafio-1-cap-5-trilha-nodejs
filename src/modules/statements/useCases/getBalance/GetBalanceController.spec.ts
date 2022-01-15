import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { AppError } from "../../../../shared/errors/AppError";

let connection: Connection;

describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Peter",
      email: "peter@gmail.com",
      password: "123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "peter@gmail.com",
      password: "123",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Water",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseBalance.body).toHaveProperty("statement");
    expect(responseBalance.body.balance).toEqual(50);
  });

  it("should be able to get a balance if token is wrong", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Peter",
      email: "peter@gmail.com",
      password: "123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "peter@gmail.com",
      password: "123",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "Water",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer 123aaa`,
      });

    expect(responseBalance.status).toEqual(401);
  });
});
