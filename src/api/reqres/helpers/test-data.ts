export class ReqresTestDataGenerator {
  static generateRandomUser() {
    const timestamp = Date.now();
    return {
      name: `morpheus_${timestamp}`,
      job: 'leader',
    };
  }

  static getValidRegisterCredentials() {
    return {
      email: 'eve.holt@reqres.in',
      password: 'pistol',
    };
  }

  static getValidLoginCredentials() {
    return {
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    };
  }
}
