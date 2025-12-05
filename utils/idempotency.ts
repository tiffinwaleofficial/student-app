/**
 * Idempotency utilities for generating keys and hashing requests
 */

/**
 * Generate a UUID v4 idempotency key
 * @returns {string} UUID v4 string
 */
export function generateIdempotencyKey(): string {
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Generate a request hash for validation
 * Creates a simple hash from method, path, and body
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {any} body - Request body
 * @returns {string} Hash string
 */
export function generateRequestHash(method: string, path: string, body: any): string {
    const bodyStr = body ? JSON.stringify(body) : '';
    const combined = `${method.toUpperCase()}:${path}:${bodyStr}`;

    // Simple hash function (for frontend, backend will use crypto)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Check if HTTP method is state-changing (requires idempotency)
 * @param {string} method - HTTP method
 * @returns {boolean} True if method is state-changing
 */
export function isStateChangingMethod(method: string): boolean {
    const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    return stateChangingMethods.includes(method.toUpperCase());
}
