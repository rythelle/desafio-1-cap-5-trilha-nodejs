import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Peter",
      email: "peter@gmail.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "peter@gmail.com",
      password: "123",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existing user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Peter",
      email: "peter@gmail.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "james@gmail.com",
      password: "123",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a non-existing password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Peter",
      email: "peter@gmail.com",
      password: "123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "peter@gmail.com",
      password: "aaa",
    });

    expect(response.status).toBe(401);
  });
});
