export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingCreatedResponse {
  bookingid: number;
  booking: Booking;
}

export interface BookingIdItem {
  bookingid: number;
}
