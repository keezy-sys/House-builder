/**
 * @typedef {"gmail" | "microsoft"} Provider
 *
 * @typedef {Object} ThreadSummary
 * @property {string} id
 * @property {string} subject
 * @property {string} snippet
 * @property {string|null} lastMessageAt
 * @property {Array<{name?: string, email?: string, role?: string}>} participants
 *
 * @typedef {Object} EmailMessage
 * @property {string} id
 * @property {string} threadId
 * @property {string|null} sentAt
 * @property {Object|null} from
 * @property {Array<Object>} to
 * @property {Array<Object>} cc
 * @property {string} subject
 * @property {string} snippet
 * @property {string|null} bodyHtml
 * @property {string|null} bodyText
 */

export {};
