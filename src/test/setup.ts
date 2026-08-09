import '@testing-library/jest-dom'

// jsdom doesn't implement scrollIntoView — NovaConversation calls it to
// auto-scroll the chat log, so stub it out to avoid a TypeError in tests.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
