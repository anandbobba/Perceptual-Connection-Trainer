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

    console.log(`[VALIDATION] Checking ${scene.connections.length} connections with ${this.rules.length} rules`);

    for (const connection of scene.connections) {
      console.log(`[VALIDATION] Connection ${connection.id}: ${connection.fromNodeId} -> ${connection.toNodeId}`);
      console.log(`  Pins: ${connection.fromPinId} -> ${connection.toPinId}`);
      
      // Each rule can return error or null
      for (const rule of this.rules) {
        const result = rule(connection, scene);
        if (result && !result.isValid) {
          console.log(`  ❌ FAILED: ${rule.name || 'unnamed rule'} - Severity: ${result.severity}`);
          results.push(result);
          break; // First error wins per connection
        }
      }
      
      if (!results.find(r => r.connectionId === connection.id)) {
        console.log(`  ✅ PASSED all rules`);
      }
    }

    console.log(`[VALIDATION] Total errors: ${results.length}`);
    return results;
  }

  clearRules(): void {
    this.rules = [];
  }
}
