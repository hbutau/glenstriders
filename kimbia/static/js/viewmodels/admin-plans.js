/**
 * Admin Plans ViewModel — custom membership tier management.
 */
function AdminPlansViewModel(app) {
  var self = this;

  self.plans = ko.observableArray([]);
  self.loading = ko.observable(false);
  self.saving = ko.observable(false);
  self.editingPlan = ko.observable(null);
  self._clubId = ko.observable(null);

  self.planForm = {
    name: ko.observable(''),
    tier_code: ko.observable(''),
    description: ko.observable(''),
    annual_fee_usd: ko.observable(''),
    monthly_fee_usd: ko.observable(0),
    is_public: ko.observable(true),
  };
  self.planBenefitsText = ko.observable('');

  self.load = async function () {
    self.loading(true);
    try {
      var clubs = await Api.get('/clubs/');
      var clubList = clubs.results || clubs;
      if (!clubList.length) return;
      self._clubId(clubList[0].id);

      var data = await Api.get('/plans/?club=' + self._clubId());
      self.plans(data.results || data);
    } catch (e) {
      console.error('Plans load failed', e);
    } finally {
      self.loading(false);
    }
  };

  self.openCreateModal = function () {
    self.editingPlan(null);
    Object.keys(self.planForm).forEach(function (k) { self.planForm[k](k === 'is_public' ? true : k === 'monthly_fee_usd' ? 0 : ''); });
    self.planBenefitsText('');
    var modal = new bootstrap.Modal(document.getElementById('planModal'));
    modal.show();
  };

  self.edit = function (plan) {
    self.editingPlan(plan);
    self.planForm.name(plan.name);
    self.planForm.tier_code(plan.tier_code);
    self.planForm.description(plan.description);
    self.planForm.annual_fee_usd(plan.annual_fee_usd);
    self.planForm.monthly_fee_usd(plan.monthly_fee_usd);
    self.planForm.is_public(plan.is_public);
    self.planBenefitsText(Array.isArray(plan.benefits) ? plan.benefits.join('\n') : '');
    var modal = new bootstrap.Modal(document.getElementById('planModal'));
    modal.show();
  };

  self.savePlan = async function () {
    self.saving(true);
    try {
      var benefits = self.planBenefitsText().split('\n')
        .map(function (b) { return b.trim(); })
        .filter(function (b) { return b; });

      var payload = {
        club: self._clubId(),
        name: self.planForm.name(),
        tier_code: self.planForm.tier_code(),
        description: self.planForm.description(),
        annual_fee_usd: parseFloat(self.planForm.annual_fee_usd()),
        monthly_fee_usd: parseFloat(self.planForm.monthly_fee_usd()) || 0,
        is_public: self.planForm.is_public(),
        benefits: benefits,
        is_active: true,
      };

      if (self.editingPlan()) {
        await Api.patch('/plans/' + self.editingPlan().id + '/', payload);
      } else {
        await Api.post('/plans/', payload);
      }

      bootstrap.Modal.getInstance(document.getElementById('planModal')).hide();
      self.load();
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally {
      self.saving(false);
    }
  };

  self.deactivate = async function (plan) {
    if (!confirm('Deactivate tier "' + plan.name + '"?')) return;
    try {
      await Api.patch('/plans/' + plan.id + '/', { is_active: false });
      self.load();
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };
}
