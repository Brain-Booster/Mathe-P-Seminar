/**
 * API helper functions
 * Centralizes API calls to avoid repeating fetch logic across the application
 */

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch data from the API
 * @param {string} endpoint - API endpoint to fetch from
 * @param {Object} options - Fetch options like method, headers, body
 * @returns {Promise<any>} - Promise that resolves to the JSON response
 */
export async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get data from the API
 * @param {string} endpoint - API endpoint to fetch from
 * @returns {Promise<any>} - Promise that resolves to the JSON response
 */
export async function getData(endpoint) {
  return fetchAPI(endpoint, { method: 'GET' });
}

/**
 * Post data to the API
 * @param {string} endpoint - API endpoint to post to
 * @param {Object} data - Data to post
 * @returns {Promise<any>} - Promise that resolves to the JSON response
 */
export async function postData(endpoint, data) {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Put data to the API
 * @param {string} endpoint - API endpoint to put to
 * @param {Object} data - Data to put
 * @returns {Promise<any>} - Promise that resolves to the JSON response
 */
export async function putData(endpoint, data) {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Delete data from the API
 * @param {string} endpoint - API endpoint to delete from
 * @returns {Promise<any>} - Promise that resolves to the JSON response
 */
export async function deleteData(endpoint) {
  return fetchAPI(endpoint, { method: 'DELETE' });
} 