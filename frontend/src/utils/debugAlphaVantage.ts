// Debug utility for Alpha Vantage API
export function debugAlphaVantageSetup() {
  const apiKey = process.env.REACT_APP_ALPHAVANTAGE_API_KEY;

  console.group('Alpha Vantage Debug Info');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key (first 4 chars):', apiKey?.substring(0, 4));
  console.log('API Key length:', apiKey?.length);
  console.groupEnd();

  return !!apiKey;
}

// Test search function
export async function testSearch(query: string = 'AAPL') {
  const apiKey = process.env.REACT_APP_ALPHAVANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`;

  console.group(`Testing Alpha Vantage Search: "${query}"`);
  console.log('URL:', url.replace(apiKey || '', 'API_KEY_HIDDEN'));

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', data);

    if (data['Error Message']) {
      console.error('Error Message:', data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Rate Limit Note:', data['Note']);
    }

    if (data.bestMatches) {
      console.log('Results Count:', data.bestMatches.length);
      console.log('First Result:', data.bestMatches[0]);
    } else {
      console.warn('No bestMatches found in response');
    }

    console.groupEnd();
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    console.groupEnd();
    throw error;
  }
}
