import { test, expect } from '@playwright/test';
import { AuthHerokuappApi } from '../../../api/herokuapp/helpers/auth-api';
import { BookingHerokuappApi } from '../../../api/herokuapp/helpers/booking-api';
import { HerokuappTestDataGenerator } from '../../../api/herokuapp/helpers/test-data';

test.describe('Restful-Booker API - Authentication & Dynamic Token Endpoints', () => {
  let authApi: AuthHerokuappApi;
  let bookingApi: BookingHerokuappApi;

  test.beforeEach(({ request }) => {
    authApi = new AuthHerokuappApi(request);
    bookingApi = new BookingHerokuappApi(request);
  });

  test('TC_AUTH_001: [Happy Path] Dynamic Token Creation with valid credentials', async () => {
    const response = await authApi.createToken({ username: 'admin', password: 'password123' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('TC_AUTH_002: [Auth Failure] Create Token with invalid username', async () => {
    const response = await authApi.createToken({ username: 'invalid_admin', password: 'password123' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('TC_AUTH_003: [Auth Failure] Create Token with invalid password', async () => {
    const response = await authApi.createToken({ username: 'admin', password: 'invalid_password' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('TC_AUTH_004: [Validation] Create Token missing password field', async () => {
    const response = await authApi.createToken({ username: 'admin' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('TC_AUTH_005: [Validation] Create Token with empty body payload', async () => {
    const response = await authApi.createToken({});
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('TC_AUTH_006: [Dynamic Token Flow] Perform PUT/DELETE using dynamic token', async () => {
    // 1. Get dynamic token
    const token = await authApi.getDynamicToken();
    expect(token).toBeTruthy();

    // 2. Create booking
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const createdBooking = await createRes.json();
    const bookingId = createdBooking.bookingid;

    // 3. Update using dynamic token
    const updateRes = await bookingApi.partialUpdateBooking(bookingId, { firstname: 'DynamicTokenUpdated' }, token);
    expect(updateRes.status()).toBe(200);

    // 4. Delete using dynamic token
    const deleteRes = await bookingApi.deleteBooking(bookingId, token);
    expect(deleteRes.status()).toBe(201);
  });

  test('TC_AUTH_007: [Auth Bypass] Perform DELETE without Cookie or Auth header', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const createdBooking = await createRes.json();

    const response = await bookingApi.deleteBooking(createdBooking.bookingid);
    expect(response.status()).toBe(403);
  });

  test('TC_AUTH_008: [Auth Failure] Perform DELETE with invalid Cookie token', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const createdBooking = await createRes.json();

    const response = await bookingApi.deleteBooking(createdBooking.bookingid, 'invalid_token_xyz');
    expect(response.status()).toBe(403);
  });

  test('TC_AUTH_009: [Alternative Auth] Perform DELETE using Basic Auth header', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const createdBooking = await createRes.json();

    const response = await bookingApi.deleteBooking(createdBooking.bookingid, undefined, 'Basic YWRtaW46cGFzc3dvcmQxMjM=');
    expect(response.status()).toBe(201);
  });
});
