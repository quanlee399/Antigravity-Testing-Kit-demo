import { test, expect } from '@playwright/test';
import { BookingHerokuappApi } from '../../../api/herokuapp/helpers/booking-api';
import { AuthHerokuappApi } from '../../../api/herokuapp/helpers/auth-api';
import { HerokuappTestDataGenerator } from '../../../api/herokuapp/helpers/test-data';

test.describe('Restful-Booker API - Booking Resource & Boundary Validation Endpoints', () => {
  let bookingApi: BookingHerokuappApi;
  let authApi: AuthHerokuappApi;
  let dynamicToken: string;
  let createdBookingId: number;

  test.beforeAll(async ({ request }) => {
    authApi = new AuthHerokuappApi(request);
    dynamicToken = await authApi.getDynamicToken();
  });

  test.beforeEach(({ request }) => {
    bookingApi = new BookingHerokuappApi(request);
  });

  test('TC_BOOKING_001: [Happy Path] Create a new booking with valid payload', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const response = await bookingApi.createBooking(booking);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
    expect(body.booking.firstname).toBe(booking.firstname);
    expect(body.booking.lastname).toBe(booking.lastname);
    createdBookingId = body.bookingid;
  });

  test('TC_BOOKING_002: [Boundary] Create booking with totalprice = 0', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({ totalprice: 0 });
    const response = await bookingApi.createBooking(booking);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.booking.totalprice).toBe(0);
  });

  test('TC_BOOKING_003: [Boundary] Create booking with negative totalprice = -100', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({ totalprice: -100 });
    const response = await bookingApi.createBooking(booking);
    expect([200, 400]).toContain(response.status());
  });

  test('TC_BOOKING_004: [Boundary] Create booking with large totalprice = 9999999', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({ totalprice: 9999999 });
    const response = await bookingApi.createBooking(booking);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.booking.totalprice).toBe(9999999);
  });

  test('TC_BOOKING_005: [Boundary] Create booking with depositpaid = false', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({ depositpaid: false });
    const response = await bookingApi.createBooking(booking);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.booking.depositpaid).toBe(false);
  });

  test('TC_BOOKING_006: [Boundary Date] Create booking with checkin == checkout', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({
      bookingdates: { checkin: '2026-09-01', checkout: '2026-09-01' },
    });
    const response = await bookingApi.createBooking(booking);
    expect(response.status()).toBe(200);
  });

  test('TC_BOOKING_007: [Boundary Date] Create booking with checkin after checkout', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({
      bookingdates: { checkin: '2026-09-10', checkout: '2026-09-01' },
    });
    const response = await bookingApi.createBooking(booking);
    expect([200, 400]).toContain(response.status());
  });

  test('TC_BOOKING_008: [Validation] Create booking missing required firstname', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    delete (booking as any).firstname;

    const response = await bookingApi.createBooking(booking);
    expect([400, 500]).toContain(response.status());
  });

  test('TC_BOOKING_009: [Validation] Create booking missing bookingdates object', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    delete (booking as any).bookingdates;

    const response = await bookingApi.createBooking(booking);
    expect([400, 500]).toContain(response.status());
  });

  test('TC_BOOKING_010: [Security/XSS] Create booking with XSS script in firstname', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking({ firstname: "<script>alert('XSS')</script>" });
    const response = await bookingApi.createBooking(booking);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.booking.firstname).toBe("<script>alert('XSS')</script>");
  });

  test('TC_BOOKING_011: [Happy Path] Get all booking IDs', async () => {
    const response = await bookingApi.getBookingIds();
    expect(response.status()).toBe(200);

    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });

  test('TC_BOOKING_012: [Filtering] Filter booking IDs by firstname and lastname', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const created = await createRes.json();

    const response = await bookingApi.getBookingIds({
      firstname: booking.firstname,
      lastname: booking.lastname,
    });
    expect(response.status()).toBe(200);

    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.some((item: any) => item.bookingid === created.bookingid)).toBe(true);
  });

  test('TC_BOOKING_013: [Filtering] Filter booking IDs by checkin and checkout dates', async () => {
    const response = await bookingApi.getBookingIds({
      checkin: '2026-01-01',
      checkout: '2026-12-31',
    });
    expect(response.status()).toBe(200);

    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
  });

  test('TC_BOOKING_014: [Happy Path] Get booking by valid ID', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const created = await createRes.json();

    const response = await bookingApi.getBookingById(created.bookingid);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.firstname).toBe(booking.firstname);
  });

  test('TC_BOOKING_015: [Negative] Get booking by non-existent ID', async () => {
    const response = await bookingApi.getBookingById(999999999);
    expect(response.status()).toBe(404);
  });

  test('TC_BOOKING_016: [Negative] Get booking by invalid string ID', async () => {
    const response = await bookingApi.getBookingById('invalid_str_id');
    expect([404, 400]).toContain(response.status());
  });

  test('TC_BOOKING_017: [Happy Path] Full Update Booking (PUT) with dynamic token', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const created = await createRes.json();

    const updatedData = { ...booking, firstname: 'UpdatedJim', lastname: 'UpdatedBrown' };
    const response = await bookingApi.updateBooking(created.bookingid, updatedData, dynamicToken);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.firstname).toBe('UpdatedJim');
    expect(body.lastname).toBe('UpdatedBrown');
  });

  test('TC_BOOKING_018: [Happy Path] Partial Update Booking (PATCH) with dynamic token', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const created = await createRes.json();

    const response = await bookingApi.partialUpdateBooking(created.bookingid, { firstname: 'PatchedJim' }, dynamicToken);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.firstname).toBe('PatchedJim');
  });

  test('TC_BOOKING_019: [Happy Path] Delete Booking (DELETE) with dynamic token', async () => {
    const booking = HerokuappTestDataGenerator.generateBooking();
    const createRes = await bookingApi.createBooking(booking);
    const created = await createRes.json();

    const response = await bookingApi.deleteBooking(created.bookingid, dynamicToken);
    expect(response.status()).toBe(201);
  });

  test('TC_BOOKING_020: [Negative] Delete non-existent booking ID', async () => {
    const response = await bookingApi.deleteBooking(999999999, dynamicToken);
    expect([405, 404]).toContain(response.status());
  });
});
