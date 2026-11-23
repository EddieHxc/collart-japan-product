/* Integration example only: NOT installed on collart.ai.
 * Use the existing main-site gtag after CMP consent, with the same GA4 stream.
 * Call these functions from actual API success handlers, never demo buttons.
 * Do not install a second gtag/GTM implementation if one already exists.
 */
export function createCollartAnalytics({gtag, measurementId, hasAnalyticsConsent}) {
  const cases = new Set(['catalog','cafe','gift','beauty','craft','illustration','general']);
  function send(event, data) {
    if (!hasAnalyticsConsent() || !/^G-[A-Z0-9]+$/.test(measurementId)) return false;
    gtag('event', event, {...data, send_to: measurementId});
    return true;
  }
  function creation(event, useCase) {
    return send(event, {use_case: cases.has(useCase) ? useCase : 'general'});
  }
  return {
    // Invoke only when the creation API has accepted a real job.
    creationAccepted: useCase => creation('creation_started', useCase),
    // Invoke only when a real output is available, once per job.
    generationSucceeded: useCase => creation('generation_succeeded', useCase),
    // Invoke only once actual checkout opens, using backend product pricing.
    checkoutOpened: ({currency, value, items}) => send('begin_checkout', {currency, value, items}),
    /* Call after YOUR authenticated backend verifies ownership and paid status.
     * This helper does not verify payment. Never pass URL/query/user-entered data.
     * Backend must persist order/event deduplication. A browser refresh must not
     * create another paid order. Prefer server-side delivery for reliability,
     * using consented client/session IDs and secrets held only on the server.
     */
    verifiedPurchase: order => {
      if (order.status !== 'paid' || !/^[A-Za-z0-9_-]{1,100}$/.test(order.analyticsOrderId || '') ||
          !/^[A-Z]{3}$/.test(order.currency || '') || !Number.isFinite(order.value) || order.value < 0 ||
          !Array.isArray(order.items) || !order.items.length) return false;
      const items = order.items.map(item => ({item_id: item.productCode, price: item.unitPrice, quantity: item.quantity}));
      if (items.some(item => !/^[A-Za-z0-9_-]{1,100}$/.test(item.item_id || '') ||
          !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1)) return false;
      return send('purchase', {transaction_id: order.analyticsOrderId, currency: order.currency, value: order.value, items});
    }
  };
}
