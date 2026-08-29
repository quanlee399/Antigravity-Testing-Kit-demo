import http from 'k6/http';
import { check, group } from 'k6';
import { ENV, DEFAULT_HEADERS } from '../config/environments.js';
import { randomThinkTime, generateTraceableData, getRandomInt } from '../utils/helpers.js';

export function petstoreScenario() {
  const baseUrl = ENV.PETSTORE_BASE_URL;

  group('Petstore_01_StoreInventory', () => {
    const res = http.get(`${baseUrl}/store/inventory`, { headers: DEFAULT_HEADERS });
    check(res, {
      'Petstore Store Inventory status is 200': (r) => r.status === 200,
    });
    randomThinkTime(1, 2);
  });

  group('Petstore_02_FindPetsByStatus', () => {
    const res = http.get(`${baseUrl}/pet/findByStatus?status=available`, { headers: DEFAULT_HEADERS });
    check(res, {
      'Petstore Find Pets status is 200': (r) => r.status === 200,
      'Petstore Find Pets returns array': (r) => {
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

  group('Petstore_03_CreatePet', () => {
    const testData = generateTraceableData('Pet');
    const petId = getRandomInt(100000, 999999);
    const payload = JSON.stringify({
      id: petId,
      category: { id: 1, name: 'Dogs' },
      name: testData.name,
      photoUrls: ['https://example.com/dog.jpg'],
      tags: [{ id: 1, name: 'friendly' }],
      status: 'available',
    });

    const res = http.post(`${baseUrl}/pet`, payload, { headers: DEFAULT_HEADERS });
    check(res, {
      'Petstore Create Pet status is 200': (r) => r.status === 200,
      'Petstore Create Pet returns ID': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id === petId;
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);

    group('Petstore_04_GetPetById', () => {
      const getRes = http.get(`${baseUrl}/pet/${petId}`, { headers: DEFAULT_HEADERS });
      check(getRes, {
        'Petstore Get Pet by ID status is 200': (r) => r.status === 200,
        'Petstore Get Pet name matches': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.name === testData.name;
          } catch (e) {
            return false;
          }
        },
      });
      randomThinkTime(1, 2);
    });
  });
}

export default function () {
  petstoreScenario();
}
