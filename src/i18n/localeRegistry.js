/**
 * Locale registry — the "plug-in point" for languages.
 *
 * Every file in ./locales/*.json is discovered at build time by Vite's
 * import.meta.glob. Adding a language therefore means adding ONE JSON file;
 * no component, service or even this registry has to change.
 *
 * Each locale file has a `_meta` block:
 *   { "name": "Español", "intl": "es-ES", "dir": "ltr" }
 */
import { buildRegistry } from './registryCore.js';

const modules = import.meta.glob('./locales/*.json', { eager: true });

export const registry = buildRegistry(modules);
export const DEFAULT_LOCALE = 'en';
