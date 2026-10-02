/**
 * Exchange Rate ViewModel — set daily RBZ USD→ZIG rate.
 */
function ExchangeRateViewModel(app) {
  var self = this;

  self.rates = ko.observableArray([]);
  self.todayRate = ko.observable(null);
  self.saving = ko.observable(false);
  self._clubId = ko.observable(null);

  var today = new Date();
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  self.newRateDate = ko.observable(
    today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate())
  );
  self.newRateValue = ko.observable('');

  self.load = async function () {
    try {
      var clubs = await Api.get('/clubs/');
      var clubList = clubs.results || clubs;
      if (!clubList.length) return;
      self._clubId(clubList[0].id);

      var data = await Api.get('/exchange-rates/?club=' + self._clubId());
      self.rates(data.results || data);

      // Check today's rate
      try {
        var t = await Api.get('/exchange-rates/today/?club=' + self._clubId());
        self.todayRate(t);
      } catch (_) {
        self.todayRate(null);
      }
    } catch (e) {
      console.error('Exchange rate load failed', e);
    }
  };

  self.setRate = async function () {
    if (!self.newRateValue()) { alert('Please enter a rate.'); return; }
    self.saving(true);
    try {
      await Api.post('/exchange-rates/', {
        club: self._clubId(),
        date: self.newRateDate(),
        usd_to_zig: parseFloat(self.newRateValue()),
      });
      self.newRateValue('');
      self.load();
    } catch (e) {
      alert('Failed to set rate: ' + e.message);
    } finally {
      self.saving(false);
    }
  };
}
