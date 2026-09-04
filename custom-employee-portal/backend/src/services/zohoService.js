const axios = require('axios');
require('dotenv').config();

// In-memory cache for the backend's single Zoho service-account access token.
// Employees never see or handle this token - it lives only on the backend.
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getZohoAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      `${process.env.ZOHO_ACCOUNTS_BASE_URL}/oauth/v2/token`,
      null,
      {
        params: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      }
    );

    cachedToken = response.data.access_token;
    // Zoho access tokens are typically valid ~1hr; refresh a little early.
    cachedTokenExpiry = now + (response.data.expires_in ? response.data.expires_in * 1000 : 55 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('Failed to retrieve Zoho Access Token:', error?.response?.data || error.message);
    throw new Error('Unable to retrieve Zoho access token');
  }
}

// Generic proxy call to a Zoho One API endpoint using the backend service account.
async function callZohoApi({ method = 'GET', path, params, data }) {
  const accessToken = await getZohoAccessToken();

  const response = await axios({
    method,
    url: `${process.env.ZOHO_API_BASE_URL}${path}`,
    params,
    data,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  return response.data;
}

module.exports = { getZohoAccessToken, callZohoApi };
