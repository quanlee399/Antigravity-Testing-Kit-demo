export class TodoistTestDataGenerator {
  static generateRandomProjectName() {
    const timestamp = Date.now();
    return `Auto_Project_${timestamp}`;
  }

  static generateRandomSectionName() {
    const timestamp = Date.now();
    return `Auto_Section_${timestamp}`;
  }

  static generateRandomTaskContent() {
    const timestamp = Date.now();
    return `Auto Task Content ${timestamp}`;
  }

  static generateRandomCommentContent() {
    const timestamp = Date.now();
    return `Auto Comment Text ${timestamp}`;
  }

  static generateRandomLabelName() {
    const timestamp = Date.now();
    return `Label_${timestamp}`;
  }
}
