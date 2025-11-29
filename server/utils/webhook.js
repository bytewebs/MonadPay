import axios from 'axios';

export const sendWebhook = async (webhookUrl, data) => {
  try {
    const response = await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds timeout
    });
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('Webhook error:', error.message);
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.message
    };
  }
};

