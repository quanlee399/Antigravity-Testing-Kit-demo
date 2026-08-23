import { test, expect } from '@playwright/test';
import { StoreApi } from '../../../api/petstore/helpers/store-api';
import { PetApi } from '../../../api/petstore/helpers/pet-api';
import { TestDataGenerator } from '../../../api/petstore/helpers/test-data';

test.describe('Petstore API - Store Resource Endpoints', () => {
  let storeApi: StoreApi;
  let petApi: PetApi;
  let createdOrderId: number;
  let createdPetId: number;

  test.beforeEach(async ({ request }) => {
    storeApi = new StoreApi(request);
    petApi = new PetApi(request);
  });

  test('TC_STORE_001: [Happy Path] Get pet inventories by status', async () => {
    const response = await storeApi.getInventory();
    expect(response.status()).toBe(200);

    const inventory = await response.json();
    expect(typeof inventory).toBe('object');
  });

  test('TC_STORE_002: [Happy Path] Place an order for a pet', async () => {
    const newPet = TestDataGenerator.generatePet();
    await petApi.addPet(newPet);
    createdPetId = newPet.id!;

    const newOrder = TestDataGenerator.generateOrder(createdPetId);
    createdOrderId = newOrder.id!;

    const response = await storeApi.placeOrder(newOrder);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(newOrder.id);
    expect(body.petId).toBe(createdPetId);
    expect(body.status).toBe('placed');
  });

  test('TC_STORE_003: [Validation] Place order with negative quantity', async () => {
    const invalidOrder = TestDataGenerator.generateOrder(1, { quantity: -5 });
    const response = await storeApi.placeOrder(invalidOrder);
    expect([200, 400]).toContain(response.status());
  });

  test('TC_STORE_004: [Happy Path] Find purchase order by ID (between 1 and 10)', async () => {
    const response = await storeApi.getOrderById(1);
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const order = await response.json();
      expect(order).toHaveProperty('id');
    }
  });

  test('TC_STORE_005: [Negative] Find purchase order by non-existent ID', async () => {
    const response = await storeApi.getOrderById(999999999);
    expect(response.status()).toBe(404);
  });

  test('TC_STORE_006: [Negative] Find order by invalid string ID', async () => {
    const response = await storeApi.getOrderById('invalid_id_str');
    expect([400, 404]).toContain(response.status());
  });

  test('TC_STORE_007: [Happy Path] Delete purchase order by ID', async () => {
    const order = TestDataGenerator.generateOrder(1);
    await storeApi.placeOrder(order);

    const response = await storeApi.deleteOrder(order.id!);
    expect([200, 404]).toContain(response.status());
  });

  test('TC_STORE_008: [Negative] Delete non-existent purchase order', async () => {
    const response = await storeApi.deleteOrder(999999999);
    expect(response.status()).toBe(404);
  });
});
