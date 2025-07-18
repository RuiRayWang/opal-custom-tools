import { tool } from '@optimizely-opal/opal-tools-sdk';

interface ExchangeRateParams {
  // No parameters needed as the tool has fixed behavior
}

interface ExchangeRateResult {
  success: boolean;
  data?: {
    baseAmount: number;
    baseCurrency: string;
    exchangeRates: Array<{
      currency: string;
      rate: number;
      convertedAmount: number;
    }>;
    lastUpdated: string;
  };
  error?: string;
}

@tool({
  name: 'exchange-rate',
  description: 'Generates a table showing exchange rates for $100 USD to Euro, Pound, SEK, DKK, and NOK',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
})
export async function exchangeRate(params: ExchangeRateParams): Promise<ExchangeRateResult> {
  try {
    // Using a free exchange rate API (you may need to replace with your preferred service)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rates = data.rates;
    
    const targetCurrencies = ['EUR', 'GBP', 'SEK', 'DKK', 'NOK'];
    const baseAmount = 100;
    
    const exchangeRates = targetCurrencies.map(currency => {
      const rate = rates[currency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${currency}`);
      }
      
      return {
        currency,
        rate,
        convertedAmount: Math.round(baseAmount * rate * 100) / 100 // Round to 2 decimal places
      };
    });
    
    return {
      success: true,
      data: {
        baseAmount,
        baseCurrency: 'USD',
        exchangeRates,
        lastUpdated: new Date().toISOString()
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
