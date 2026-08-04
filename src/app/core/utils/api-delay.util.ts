/**
 * Simule la latence d'un appel réseau vers l'API Spring Boot
 * @param ms Temps en millisecondes (défaut: 800ms)
 * @returns Une promesse qui se résout après le délai
 */
export function simulateApiCall(ms: number = 800): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
