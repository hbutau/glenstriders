/**
 * Membership ViewModel — show memberships, join club, QR card.
 */
function MembershipViewModel(app) {
  var self = this;

  self.memberships = ko.observableArray([]);
  self.availablePlans = ko.observableArray([]);
  self.loading = ko.observable(false);
  self.saving = ko.observable(false);
  self.selectedCard = ko.observable(null);
  self.selectedPlanId = ko.observable('');
  self.paymentCurrency = ko.observable('USD');

  self.load = async function () {
    self.loading(true);
    try {
      var data = await Api.get('/memberships/me/');
      self.memberships(data.results || data);
    } catch (e) {
      console.error('Memberships load failed', e);
    } finally {
      self.loading(false);
    }
  };

  self.showCard = async function (membership) {
    try {
      var cardData = await Api.get('/memberships/' + membership.id + '/card/');
      self.selectedCard(cardData);
      var modal = new bootstrap.Modal(document.getElementById('memberCardModal'));
      modal.show();
    } catch (e) {
      alert('Failed to load card: ' + e.message);
    }
  };

  self.renew = async function (membership) {
    if (!confirm('Renew your membership for another year?')) return;
    try {
      var data = await Api.post('/memberships/' + membership.id + '/renew/', {});
      alert('Renewal initiated. Please complete payment.');
      self.load();
    } catch (e) {
      alert('Renew failed: ' + e.message);
    }
  };

  self.openJoinModal = async function () {
    // Load plans for current club
    try {
      var plans = await Api.get('/plans/');
      self.availablePlans((plans.results || plans).filter(function (p) { return p.is_public && p.is_active; }));
    } catch (e) {
      console.error('Plans load failed', e);
    }
    var modal = new bootstrap.Modal(document.getElementById('joinClubModal'));
    modal.show();
  };

  self.selectPlan = function (plan) {
    self.selectedPlanId(plan.id);
  };

  self.joinAndPay = async function () {
    if (!self.selectedPlanId()) { alert('Please select a membership tier.'); return; }
    self.saving(true);
    try {
      // Step 1: Create a pending membership + transaction
      var plan = self.availablePlans().find(function (p) { return p.id === self.selectedPlanId(); });
      var membership = await Api.post('/memberships/', { plan: self.selectedPlanId(), club: plan.club });

      // Step 2: Create a pending transaction for the subscription fee
      var tx = await Api.post('/transactions/', {
        club: plan.club,
        membership: membership.id,
        transaction_type: 'subscription',
        amount_usd: plan.annual_fee_usd,
        description: 'Annual subscription — ' + plan.name,
        payment_method: 'pesepay',
      });

      // Step 3: Initiate PesePay
      var payData = await Api.post('/payments/pesepay/initiate/', {
        transaction_id: tx.id,
        currency: self.paymentCurrency(),
        return_url: window.location.origin + '/app/membership/',
      });

      bootstrap.Modal.getInstance(document.getElementById('joinClubModal')).hide();

      if (payData.redirect_url) {
        window.location.href = payData.redirect_url;
      } else {
        alert('Payment initiated. Reference: ' + payData.reference_number);
      }
    } catch (e) {
      alert('Join failed: ' + e.message);
    } finally {
      self.saving(false);
    }
  };
}
