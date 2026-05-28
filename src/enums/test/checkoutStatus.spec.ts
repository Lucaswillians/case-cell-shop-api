import { CheckoutStatus } from '../checkoutStatus';
import { describe, expect, it } from '@jest/globals';

describe('CheckoutStatus', () => {
  it('should expose all checkout statuses with their persisted values', () => {
    expect(CheckoutStatus).toEqual({
      PENDING: 'pending',
      APPROVED: 'approved',
      FAILED: 'failed',
      CANCELED: 'canceled',
    });
  });
});
