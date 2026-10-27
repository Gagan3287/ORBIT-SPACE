/**
 * ADAPTER PATTERN
 * LegacyGateway speaks paise + last4 + numeric codes. PaymentAdapter converts
 * it to the interface the app wants: pay({ amountINR, cardNumber, name }).
 * MOCK ONLY - no real gateway, no real money.
 */
class LegacyGateway {
  chargePaise(paise, last4, holder) {
    if (last4 === '0000') return { code: 51, msg: 'DECLINED' };
    return { code: 0, msg: 'OK', txn: 'TXN' + Date.now().toString(36).toUpperCase() };
  }
}
class PaymentAdapter {
  constructor(gateway = new LegacyGateway()) { this.gateway = gateway; }
  async pay({ amountINR, cardNumber, name }) {
    const digits = String(cardNumber || '').replace(/\D/g, '');
    if (digits.length < 12) throw new Error('Invalid card number.');
    await new Promise(r => setTimeout(r, 1800));
    const res = this.gateway.chargePaise(Math.round(amountINR * 100), digits.slice(-4), name);
    if (res.code !== 0) throw new Error('Payment declined (demo: a card ending 0000 always fails).');
    return { success: true, reference: res.txn };
  }
}
