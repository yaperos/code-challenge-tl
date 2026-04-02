import { Injectable, Logger } from '@nestjs/common';

export class TimeoutError extends Error {}

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);

  async settle(transferId: string, fromCurrency: string, toCurrency: string, amount: number): Promise<void> {
    if (fromCurrency === toCurrency) {
      return; // No FX needed
    }

    this.logger.log(`Settling FX for transfer ${transferId} - ${amount} ${fromCurrency} to ${toCurrency}`);

    // Simular un timeout como pide la 'Optional escalation'
    // Forzaremos que si un transferId contiene 'timeout', lanza TimeoutError
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (transferId.includes('timeout')) {
          this.logger.warn(`FX provider timeout for transfer ${transferId}`);
          reject(new TimeoutError('FX Provider did not respond within 5000ms'));
        } else {
          this.logger.log(`FX Settled successfully for transfer ${transferId}`);
          resolve();
        }
      }, 500); // Para pruebas reducimos a 500ms
    });
  }
}
