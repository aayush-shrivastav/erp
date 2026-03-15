# Fix api.getLedger is not a function Error

## Steps:

1. ✅ [DONE] Understand problem and create detailed plan
2. ✅ Add `getLedger` controller function to `backend/src/controllers/accountsTransactionController.js`
3. ✅ Add `GET /api/accounts/ledger/:rollNo` route to `backend/src/routes/accountRoutes.js`
4. ✅ Create `frontend/src/services/accountsService.js` with `getLedger` wrapper
5. ✅ Update `frontend/src/pages/accounts/StudentLedgerPage.jsx` - replace `api.getLedger` with `accountsService.getLedger`
6. [FOLLOWUP] Test endpoint and restart backend
7. [FOLLOWUP] Run frontend tests

**Next step:** Test the fix
