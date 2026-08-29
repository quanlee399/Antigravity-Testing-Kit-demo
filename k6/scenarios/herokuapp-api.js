import http from 'k6/http';
import { check, group } from 'k6';
import { ENV, DEFAULT_HEADERS } from '../config/environments.js';
import { getBookerToken } from '../utils/auth.js';
import { randomThinkTime, generateTraceableData, getRandomInt } from '../utils/helpers.js';

export function herokuappScenario() {
  const baseUrl = ENV.HEROKUAPP_BASE_URL;

  group('Herokuapp_01_Ping', () => {
    const res = http.get(`${baseUrl}/ping`);
    check(res, {
      'Booker Ping status is 201 Created or 200': (r) => r.status === 201 || r.status === 200,
    });
    randomThinkTime(1, 2);
  });

  group('Herokuapp_02_Auth', () => {
    const token = getBookerToken();
    check(token, {
      'Booker Auth Token acquired': (t) => typeof t === 'string',
    });
    randomThinkTime(1, 2);
  });

  group('Herokuapp_03_GetBookings', () => {
    const res = http.get(`${baseUrl}/booking`, { headers: DEFAULT_HEADERS });
    check(res, {
      'Booker Get Bookings status is 200': (r) => r.status === 200,
      'Booker Bookings list is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);
  });

  group('Herokuapp_04_CreateBooking', () => {
    const testData = generateTraceableData('Guest');
    const payload = JSON.stringify({
      firstname: testData.name,
      lastname: 'PerformanceTester',
      totalprice: getRandomInt(100, 500),
      depositpaid: true,
      bookingdates: {
        checkin: '2026-09-01',
        checkout: '2026-09-05',
      },
      additionalneeds: 'Breakfast',
    });

    const res = http.post(`${baseUrl}/booking`, payload, { headers: DEFAULT_HEADERS });
    let createdBookingId = null;

    check(res, {
      'Booker Create Booking status is 200': (r) => r.status === 200,
      'Booker Create Booking returns bookingid': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.bookingid) {
            createdBookingId = body.bookingid;
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);

    if (createdBookingId) {
      group('Herokuapp_05_GetBookingDetail', () => {
        const detailRes = http.get(`${baseUrl}/booking/${createdBookingId}`, { headers: DEFAULT_HEADERS });
        check(detailRes, {
          'Booker Get Detail status is 200': (r) => r.status === 200,
          'Booker Get Detail has correct firstname': (r) => {
            try {
              const body = JSON.parse(r.body);
              return body.firstname === testData.name;
            } catch (e) {
              return false;
            }
          },
        });
        randomThinkTime(1, 2);
      });
    }
  });
}

export default function () {
  herokuappScenario();
}
