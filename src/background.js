// Background script

// Proxy server URL - replace with the actual deployed server URL when in production
// const PROXY_SERVER_URL = 'chrome-dictionary-proxy-server.vercel.app';
const PROXY_SERVER_URL = 'https://contextual-dictionary-extension.vercel.app';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeText') {
    analyzeTextWithAI(message.text, message.context)
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((error) => {
        console.error('Error in text analysis:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async sendResponse
  } else if (message.action === 'getDefinition') {
    getDefinitionAI(message.text, message.context)
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((error) => {
        console.error('Error in definition', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async sendResponse
  }
});

// AI analysis function
async function analyzeTextWithAI(text, context) {
  try {
    const response = await fetch(`${PROXY_SERVER_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || 'ANALYZING: Failed to get analysis from proxy server'
      );
    }

    const data = await response.json();
    console.log('AI RESPONSE:', data.result);
    return data.result;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

async function getDefinitionAI(text, context) {
  try {
    const response = await fetch(`${PROXY_SERVER_URL}/api/definition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          'DEFINITION: Failed to get definition from proxy server'
      );
    }

    const data = await response.json();
    console.log('AI Definition Response:', data.result);
    return data.result;
  } catch (error) {
    console.error('AI definition error:', error);
    throw error;
  }
}
/*
TODO: What if there are multiple definitions? -> need to make them a list, <oi>Def1</oi>, <oi>Def2</oi>, ...
      - splitter: '-'
      - use splitter to separate definitions.

TODO: Add Show Analysis button. -> Show analysis (Expand below Definition).
      Separate between Definition and Analysis.
*/
