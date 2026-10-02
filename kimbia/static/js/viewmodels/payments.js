/**
 * Payments ViewModel — personal transaction history.
 */
function PaymentsViewModel(app) {
  var self = this;

  self.transactions = ko.observableArray([]);
  self.loading = ko.observable(false);

  self.load = async function () {
    self.loading(true);
    try {
      var data = await Api.get('/transactions/');
      self.transactions(data.results || data);
    } catch (e) {
      console.error('Transactions load failed', e);
    } finally {
      self.loading(false);
    }
  };
}
