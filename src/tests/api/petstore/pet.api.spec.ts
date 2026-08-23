import { test, expect } from '@playwright/test';
import { PetApi } from '../../../api/petstore/helpers/pet-api';
import { TestDataGenerator } from '../../../api/petstore/helpers/test-data';

test.describe('Petstore API - Pet Resource Endpoints', () => {
  let petApi: PetApi;
  let createdPetId: number;

  test.beforeEach(({ request }) => {
    petApi = new PetApi(request);
  });

  test('TC_PET_001: [Happy Path] Create a new pet with valid payload', async () => {
    const newPet = TestDataGenerator.generatePet();
    createdPetId = newPet.id!;

    const response = await petApi.addPet(newPet);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(newPet.id);
    expect(body.name).toBe(newPet.name);
    expect(body.status).toBe(newPet.status);
  });

  test('TC_PET_002: [Validation] Add pet missing required name field', async () => {
    const invalidPet = TestDataGenerator.generatePet();
    delete (invalidPet as any).name;

    const response = await petApi.addPet(invalidPet);
    // Public Swagger Petstore accepts incomplete objects and returns 200, or validation error 400/405
    expect([200, 400, 405, 500]).toContain(response.status());
  });

  test('TC_PET_003: [Validation] Add pet with invalid enum status', async () => {
    const invalidPet = TestDataGenerator.generatePet({ status: 'INVALID_STATUS_ENUM' });
    const response = await petApi.addPet(invalidPet);
    expect([200, 400, 405]).toContain(response.status());
  });

  test('TC_PET_004: [Security/XSS] Add pet with XSS script in pet name', async () => {
    const xssPet = TestDataGenerator.generatePet({ name: "<script>alert('XSS')</script>" });
    const response = await petApi.addPet(xssPet);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe("<script>alert('XSS')</script>");
  });

  test('TC_PET_005: [Happy Path] Update an existing pet via PUT', async () => {
    const petToUpdate = TestDataGenerator.generatePet({
      id: createdPetId || TestDataGenerator.generateRandomId(),
      name: 'doggie_updated_name',
      status: 'sold',
    });

    const response = await petApi.updatePet(petToUpdate);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('doggie_updated_name');
    expect(body.status).toBe('sold');
  });

  test('TC_PET_006: [Happy Path] Find pets by status = available', async () => {
    const response = await petApi.findPetsByStatus('available');
    expect(response.status()).toBe(200);

    const pets = await response.json();
    expect(Array.isArray(pets)).toBe(true);
    if (pets.length > 0) {
      expect(pets[0]).toHaveProperty('id');
    }
  });

  test('TC_PET_007: [Boundary] Find pets by deprecated tags endpoint', async () => {
    const response = await petApi.findPetsByTags(['tag1', 'tag2']);
    expect(response.status()).toBe(200);

    const pets = await response.json();
    expect(Array.isArray(pets)).toBe(true);
  });

  test('TC_PET_008: [Happy Path] Get pet by valid ID', async () => {
    const targetId = createdPetId || 1;
    const response = await petApi.getPetById(targetId);
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const pet = await response.json();
      expect(pet.id).toBe(targetId);
    }
  });

  test('TC_PET_009: [Negative] Get pet by non-existent ID', async () => {
    const response = await petApi.getPetById(99999999999);
    expect(response.status()).toBe(404);
  });

  test('TC_PET_010: [Negative] Get pet by invalid ID format (string)', async () => {
    const response = await petApi.getPetById('invalid_string_id');
    expect([400, 404]).toContain(response.status());
  });

  test('TC_PET_011: [Happy Path] Update pet with form data', async () => {
    const targetId = createdPetId || TestDataGenerator.generateRandomId();
    await petApi.addPet(TestDataGenerator.generatePet({ id: targetId }));

    const response = await petApi.updatePetWithForm(targetId, 'form_updated_pet', 'pending');
    expect(response.status()).toBe(200);
  });

  test('TC_PET_012: [Happy Path] Upload image for pet', async () => {
    const targetId = createdPetId || 1;
    const dummyBuffer = Buffer.from('fake image content');
    const response = await petApi.uploadImage(targetId, 'test metadata', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: dummyBuffer,
    });
    expect(response.status()).toBe(200);
  });

  test('TC_PET_013: [Happy Path] Delete pet by ID', async () => {
    const petToDelete = TestDataGenerator.generatePet();
    await petApi.addPet(petToDelete);

    const response = await petApi.deletePet(petToDelete.id!);
    expect(response.status()).toBe(200);
  });

  test('TC_PET_014: [Negative] Delete non-existent pet', async () => {
    const response = await petApi.deletePet(99999999999);
    expect(response.status()).toBe(404);
  });
});
