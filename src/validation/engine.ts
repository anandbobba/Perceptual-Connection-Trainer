import { Scene, ValidationResult, ValidationRule } from '../types';

// Central validation engine - deterministic, no randomness
export class ValidationEngine {
  private rules: ValidationRule[] = [];

  registerRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  // Validates all connections independently
  validate(scene: Scene): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const connection of scene.connections) {
      // Each rule can return error or null
      for (const rule of this.rules) {
        const result = rule(connection, scene);
        if (result && !result.isValid) {
          results.push(result);
          break; // First error wins per connection
        }
      }
    }

    return results;
  }

  clearRules(): void {
    this.rules = [];
  }
}
