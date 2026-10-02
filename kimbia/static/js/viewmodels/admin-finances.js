/**
 * Admin Finances ViewModel — monthly report + manual payments.
 */
function AdminFinancesViewModel(app) {
  var self = this;

  self.transactions = ko.observableArray([]);
  self.loading = ko.observable(false);
  self.saving = ko.observable(false);

  var now = new Date();
  self.selectedMonth = ko.observable(now.getMonth() + 1);
  self.selectedYear = ko.observable(now.getFullYear());

  self.months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];
  self.years = [now.getFullYear() - 1, now.getFullYear()];

  self.report = {
    income_usd: ko.observable(0),
    expenses_usd: ko.observable(0),
    net_usd: ko.observable(0),
  };

  self.manual = {
    description: ko.observable(''),
    amount_usd: ko.observable(''),
    transaction_type: ko.observable('manual'),
    payment_method: ko.observable('cash'),
  };

  self._clubId = ko.observable(null);

  self.load = async function () {
    self.loading(true);
    try {
      var clubs = await Api.get('/clubs/');
      var clubList = clubs.results || clubs;
      if (!clubList.length) return;
      self._clubId(clubList[0].id);

      var data = await Api.get('/transactions/?type=&status=');
      self.transactions(data.results || data);

      await self.loadReport();
    } catch (e) {
      console.error('Finances load failed', e);
    } finally {
      self.loading(false);
    }
  };

  self.loadReport = async function () {
    if (!self._clubId()) return;
    try {
      var r = await Api.get(
        '/transactions/report/?club=' + self._clubId() +
        '&month=' + self.selectedMonth() +
        '&year=' + self.selectedYear()
      );
      self.report.income_usd(r.income_usd);
      self.report.expenses_usd(r.expenses_usd);
      self.report.net_usd(r.net_usd);
    } catch (e) {
      console.error('Report load failed', e);
    }
  };

  self.recordManual = async function () {
    if (!self._clubId()) { alert('No club found.'); return; }
    self.saving(true);
    try {
      await Api.post('/transactions/', {
        club: self._clubId(),
        transaction_type: self.manual.transaction_type(),
        description: self.manual.description(),
        amount_usd: parseFloat(self.manual.amount_usd()),
        payment_method: self.manual.payment_method(),
        currency_paid: 'USD',
      });
      self.manual.description('');
      self.manual.amount_usd('');
      self.load();
    } catch (e) {
      alert('Record failed: ' + e.message);
    } finally {
      self.saving(false);
    }
  };
}
