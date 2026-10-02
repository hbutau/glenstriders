/**
 * Admin Members ViewModel.
 */
function AdminMembersViewModel(app) {
  var self = this;

  self.members = ko.observableArray([]);
  self.loading = ko.observable(false);
  self.searchQuery = ko.observable('');

  self.filtered = ko.computed(function () {
    var q = self.searchQuery().toLowerCase();
    if (!q) return self.members();
    return self.members().filter(function (m) {
      return (m.user_full_name || '').toLowerCase().includes(q);
    });
  });

  self.load = async function () {
    self.loading(true);
    try {
      // Get the first club the user has admin access to
      var clubs = await Api.get('/clubs/');
      var clubList = clubs.results || clubs;
      if (!clubList.length) return;
      var data = await Api.get('/clubs/' + clubList[0].id + '/members/');
      self.members(data.results || data);
    } catch (e) {
      console.error('Members load failed', e);
    } finally {
      self.loading(false);
    }
  };

  self.suspend = async function (membership) {
    if (!confirm('Suspend ' + membership.user_full_name + '?')) return;
    try {
      await Api.patch('/memberships/' + membership.id + '/', { status: 'suspended' });
      self.load();
    } catch (e) {
      alert('Suspend failed: ' + e.message);
    }
  };
}
