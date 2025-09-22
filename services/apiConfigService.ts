
import { ApiConfigs } from '../types';

// This simulates a login token that would be stored after user authentication.
const MOCK_AUTH_TOKEN = 'Bearer super-secret-django-token';

const API_STORAGE_KEY = 'django_api_configs';

// Simulates a GET request to a Django backend to fetch saved keys.
export const getApiConfigs = async (): Promise<ApiConfigs> => {
  console.log('Fetching API configs from backend...');
  // In a real app, this would be:
  // const response = await fetch('/api/keys', {
  //   headers: { 'Authorization': MOCK_AUTH_TOKEN }
  // });
  // const data = await response.json();
  // return data;

  // Simulation using localStorage
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  const storedData = localStorage.getItem(API_STORAGE_KEY);
  if (storedData) {
    console.log('Configs loaded from storage.');
    return JSON.parse(storedData);
  }
  console.log('No configs found.');
  return { claudeApiKey: '', chatGptApiKey: '' };
};

// Simulates a POST request to a Django backend to save keys.
export const saveApiConfigs = async (configs: ApiConfigs): Promise<boolean> => {
    console.log('Saving API configs to backend...');
    // In a real app, this would be:
    // const response = await fetch('/api/keys', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': MOCK_AUTH_TOKEN,
    //   },
    //   body: JSON.stringify(configs),
    // });
    // return response.ok;
    
    // Simulation using localStorage
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(configs));
    console.log('Configs saved.');
    return true;
};

// Simulates testing the connection for a given API key.
// The backend would typically handle the actual test call to the third-party API.
export const testApiConnection = async (apiKey: string): Promise<boolean> => {
    console.log(`Testing API connection for key: ${apiKey.substring(0, 5)}...`);
    // In a real app, this would be a backend endpoint call:
    // const response = await fetch('/api/test-connection', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': MOCK_AUTH_TOKEN },
    //   body: JSON.stringify({ apiKey, apiType })
    // });
    // const data = await response.json();
    // return data.connected;

    // Simulation: connection is successful if key is not empty and has a certain length.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate test delay
    const isValid = apiKey.trim() !== '' && apiKey.length > 10;
    console.log(`Connection test result: ${isValid}`);
    return isValid;
};
