import { Booking } from '../models/booking.model';

export class HerokuappTestDataGenerator {
  static generateBooking(customValues: Partial<Booking> = {}): Booking {
    const timestamp = Date.now();
    return {
      firstname: `Jim_${timestamp}`,
      lastname: `Brown_${timestamp}`,
      totalprice: Math.floor(100 + Math.random() * 500),
      depositpaid: true,
      bookingdates: {
        checkin: '2026-09-01',
        checkout: '2026-09-10',
      },
      additionalneeds: 'Breakfast',
      ...customValues,
    };
  }
}
