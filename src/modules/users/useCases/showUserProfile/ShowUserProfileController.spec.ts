import { app } from "../../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";

let connection: Connection;

describe("Show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
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

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show user profile if token is invalid", async () => {
    await request(app).post("/api/v1/users").send({
      name: "Peter",
      email: "peter@gmail.com",
      password: "123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "peter@gmail.com",
      password: "123",
    });
    
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer aaa777`,
    });

    expect(response.status).toBe(401);
  });
});
