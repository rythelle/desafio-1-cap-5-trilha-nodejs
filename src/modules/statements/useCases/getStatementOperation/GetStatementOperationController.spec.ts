import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement operation", async () => {
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

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.body).toHaveProperty("id");
  });

  it("should not be able to get a statement operation with incorrect token", async () => {
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

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = await request(app)
      .get(`/api/v1/statements/${deposit.body.id}`)
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer test123`,
      });

    expect(statement.body.message).toEqual("JWT invalid token!");
  });

  it("should not be able to get a statement operation with incorrect id", async () => {
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

    const deposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = await request(app)
      .get(`/api/v1/statements/111aaa-a11`)
      .send({
        amount: 100,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(statement.status).toEqual(500);
  });
});
