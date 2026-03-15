import api from './api.js';

/**
 * Accounts Service - Wrapper for accounts-related API calls
 */
const accountsService = {
  // Get ledger for a student by roll number
  getLedger: async (rollNo) => {
    const response = await api.get(`/accounts/ledger/${rollNo}`);
    return response.data;
  },

  // Verify student (existing endpoint)
  verifyStudent: async (rollNo) => {
    const response = await api.get(`/accounts/student/${rollNo}`);
    return response.data;
  },

  // Get transactions for student
  getTransactions: async (rollNo, params = {}) => {
    const response = await api.get(`/accounts/transactions/${rollNo}`, { params });
    return response.data;
  },

  // Add college fee payment
  addCollegeFee: async (data) => {
    const response = await api.post('/accounts/college-fee', data);
    return response.data;
  },

  // Add bus fee payment
  addBusFee: async (data) => {
    const response = await api.post('/accounts/bus-fee', data);
    return response.data;
  },

  // Add fine payment
  addFine: async (data) => {
    const response = await api.post('/accounts/fine', data);
    return response.data;
  }
};

export default accountsService;
</xai:function_call >

<xai:function_call name="edit_file">
<parameter name="path">d:/kkkk/backend/src/controllers/accountsTransactionController.js
