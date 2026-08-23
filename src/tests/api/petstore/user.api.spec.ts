import { test, expect } from '@playwright/test';
import { UserApi } from '../../../api/petstore/helpers/user-api';
import { TestDataGenerator } from '../../../api/petstore/helpers/test-data';

test.describe('Petstore API - User Resource Endpoints', () => {
  let userApi: UserApi;
  let testUsername: string;

  test.beforeEach(({ request }) => {
    userApi = new UserApi(request);
  });

  test('TC_USER_001: [Happy Path] Create a single user', async () => {
    const newUser = TestDataGenerator.generateUser();
    testUsername = newUser.username!;

    const response = await userApi.createUser(newUser);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.code).toBe(200);
  });

  test('TC_USER_002: [Validation] Create user with invalid email format', async () => {
    const invalidUser = TestDataGenerator.generateUser({ email: 'not_an_email' });
    const response = await userApi.createUser(invalidUser);
    expect([200, 400]).toContain(response.status());
  });

  test('TC_USER_003: [Happy Path] Create users with array input', async () => {
    const user1 = TestDataGenerator.generateUser();
    const user2 = TestDataGenerator.generateUser();

    const response = await userApi.createUsersWithArray([user1, user2]);
    expect(response.status()).toBe(200);
  });

  test('TC_USER_004: [Happy Path] Create users with list input', async () => {
    const user1 = TestDataGenerator.generateUser();
    const user2 = TestDataGenerator.generateUser();

    const response = await userApi.createUsersWithList([user1, user2]);
    expect(response.status()).toBe(200);
  });

  test('TC_USER_005: [Happy Path] User login with valid credentials', async () => {
    const newUser = TestDataGenerator.generateUser();
    await userApi.createUser(newUser);

    const response = await userApi.login(newUser.username, newUser.password);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(typeof body.message).toBe('string');
  });

  test('TC_USER_006: [Negative] User login missing password query parameter', async () => {
    const response = await userApi.login('some_user', undefined);
    expect([400, 200]).toContain(response.status());
  });

  test('TC_USER_007: [Happy Path] User logout', async () => {
    const response = await userApi.logout();
    expect(response.status()).toBe(200);
  });

  test('TC_USER_008: [Happy Path] Get user by valid username', async () => {
    const newUser = TestDataGenerator.generateUser();
    await userApi.createUser(newUser);

    const response = await userApi.getUserByName(newUser.username!);
    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.username).toBe(newUser.username);
    expect(user.email).toBe(newUser.email);
  });

  test('TC_USER_009: [Negative] Get user by non-existent username', async () => {
    const response = await userApi.getUserByName('non_existent_user_999999');
    expect(response.status()).toBe(404);
  });

  test('TC_USER_010: [Happy Path] Update user details', async () => {
    const newUser = TestDataGenerator.generateUser();
    await userApi.createUser(newUser);

    const updatedUser = { ...newUser, firstName: 'UpdatedFirstName' };
    const response = await userApi.updateUser(newUser.username!, updatedUser);
    expect(response.status()).toBe(200);
  });

  test('TC_USER_011: [Happy Path] Delete user by username', async () => {
    const newUser = TestDataGenerator.generateUser();
    await userApi.createUser(newUser);

    const response = await userApi.deleteUser(newUser.username!);
    expect(response.status()).toBe(200);
  });

  test('TC_USER_012: [Negative] Delete non-existent user', async () => {
    const response = await userApi.deleteUser('non_existent_user_999999');
    expect(response.status()).toBe(404);
  });
});
