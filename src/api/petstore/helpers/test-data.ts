import { Pet } from '../models/pet.model';
import { Order } from '../models/store.model';
import { User } from '../models/user.model';

export class TestDataGenerator {
  static generateRandomId(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  static generatePet(customValues: Partial<Pet> = {}): Pet {
    const randomId = this.generateRandomId();
    const timestamp = Date.now();
    return {
      id: randomId,
      category: {
        id: 1,
        name: 'Dogs',
      },
      name: `auto_pet_${timestamp}`,
      photoUrls: [`https://example.com/pet_${randomId}.jpg`],
      tags: [
        {
          id: 1,
          name: `tag_auto_${randomId}`,
        },
      ],
      status: 'available',
      ...customValues,
    };
  }

  static generateOrder(petId: number, customValues: Partial<Order> = {}): Order {
    const randomId = this.generateRandomId();
    return {
      id: randomId,
      petId: petId,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: 'placed',
      complete: true,
      ...customValues,
    };
  }

  static generateUser(customValues: Partial<User> = {}): User {
    const timestamp = Date.now();
    const randomId = this.generateRandomId();
    return {
      id: randomId,
      username: `auto_user_${timestamp}`,
      firstName: 'Automation',
      lastName: 'Tester',
      email: `auto_user_${timestamp}@test.com`,
      password: 'PassWord123!',
      phone: '0901234567',
      userStatus: 1,
      ...customValues,
    };
  }
}
