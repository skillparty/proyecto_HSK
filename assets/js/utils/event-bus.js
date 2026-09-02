/**
 * event-bus.js — Lightweight Publish/Subscribe Event Bus for Confuc10++
 * Desacopla controladores y módulos permitiendo comunicación orientada a eventos
 * sin referencias circulares directas a window.app.
 */
(function () {
  "use strict";

  class EventBus {
    constructor() {
      this._listeners = new Map();
    }

    /**
     * Suscribe un callback a un evento.
     * @param {string} event Nombre del evento (ej: 'auth:change', 'progress:update')
     * @param {Function} handler Función callback a ejecutar
     * @returns {Function} Función para cancelar la suscripción
     */
    on(event, handler) {
      if (typeof event !== "string" || typeof handler !== "function") {
        return () => {};
      }

      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }

      this._listeners.get(event).add(handler);

      // Devuelve función de desuscripción directa
      return () => this.off(event, handler);
    }

    /**
     * Suscribe un callback que se ejecutará una sola vez.
     * @param {string} event Nombre del evento
     * @param {Function} handler Función callback a ejecutar
     * @returns {Function} Función para cancelar la suscripción
     */
    once(event, handler) {
      if (typeof event !== "string" || typeof handler !== "function") {
        return () => {};
      }

      const onceWrapper = (...args) => {
        this.off(event, onceWrapper);
        handler(...args);
      };

      return this.on(event, onceWrapper);
    }

    /**
     * Elimina un callback registrado para un evento, o todos si no se pasa handler.
     * @param {string} event Nombre del evento
     * @param {Function} [handler] Función a remover
     */
    off(event, handler) {
      if (!this._listeners.has(event)) return;

      if (!handler) {
        this._listeners.delete(event);
        return;
      }

      const handlers = this._listeners.get(event);
      handlers.delete(handler);

      if (handlers.size === 0) {
        this._listeners.delete(event);
      }
    }

    /**
     * Emite un evento a todos los suscriptores registrados.
     * Los errores en un listener individual son capturados para no romper los demás.
     * @param {string} event Nombre del evento
     * @param {...*} args Argumentos pasados a los handlers
     */
    emit(event, ...args) {
      if (!this._listeners.has(event)) return;

      const handlers = [...this._listeners.get(event)];
      for (const handler of handlers) {
        try {
          handler(...args);
        } catch (error) {
          (window.hskLogger || console).error(
            `[EventBus] Error executing listener for event "${event}":`,
            error,
          );
        }
      }
    }

    /**
     * Retorna la cantidad de listeners activos para un evento dado.
     * @param {string} event Nombre del evento
     * @returns {number}
     */
    listenerCount(event) {
      return this._listeners.has(event) ? this._listeners.get(event).size : 0;
    }

    /**
     * Limpia todas las suscripciones registradas.
     */
    clear() {
      this._listeners.clear();
    }
  }

  const busInstance = new EventBus();

  // Exponer globalmente para arquitectura basada en scripts clásicos
  window.HSKEventBus = EventBus;
  window.hskEventBus = busInstance;

  // Soporte para entornos de testing / CommonJS
  if (typeof module !== "undefined" && module.exports) {
    module.exports = EventBus;
  }
})();
