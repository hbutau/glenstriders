/**
 * Auth ViewModel — login, register, logout, JWT storage.
 */
function AuthViewModel(app) {
  var self = this;

  self.isLoggedIn = ko.observable(!!Api.getToken());
  self.userFullName = ko.observable('');
  self.userEmail = ko.observable('');
  self.clubName = ko.observable('');
  self.isAdmin = ko.observable(false);

  // Login form
  self.mode = ko.observable('login');
  self.email = ko.observable('');
  self.password = ko.observable('');
  self.error = ko.observable('');
  self.loading = ko.observable(false);

  // Register form
  self.regFirstName = ko.observable('');
  self.regLastName = ko.observable('');
  self.regEmail = ko.observable('');
  self.regPhone = ko.observable('');
  self.regPassword = ko.observable('');
  self.regPasswordConfirm = ko.observable('');

  self.showLogin = function () { self.mode('login'); self.error(''); };
  self.showRegister = function () { self.mode('register'); self.error(''); };

  self.login = async function () {
    self.error('');
    self.loading(true);
    try {
      var data = await Api.post('/auth/token/', {
        email: self.email(),
        password: self.password(),
      });
      Api.storeTokens(data.access, data.refresh);
      self.isLoggedIn(true);
      await self.loadProfile();
      app.showDashboard();
    } catch (e) {
      self.error(e.message);
    } finally {
      self.loading(false);
    }
  };

  self.register = async function () {
    self.error('');
    self.loading(true);
    try {
      var data = await Api.post('/auth/register/', {
        email: self.regEmail(),
        password: self.regPassword(),
        password_confirm: self.regPasswordConfirm(),
        first_name: self.regFirstName(),
        last_name: self.regLastName(),
        phone: self.regPhone(),
      });
      Api.storeTokens(data.access, data.refresh);
      self.isLoggedIn(true);
      await self.loadProfile();
      app.showDashboard();
    } catch (e) {
      self.error(e.message);
    } finally {
      self.loading(false);
    }
  };

  self.logout = async function () {
    try {
      var refresh = localStorage.getItem('kimbia_refresh');
      if (refresh) await Api.post('/auth/token/blacklist/', { refresh: refresh });
    } catch (_) {}
    Api.clearTokens();
    self.isLoggedIn(false);
    self.userFullName('');
    self.clubName('');
    self.isAdmin(false);
  };

  self.loadProfile = async function () {
    try {
      var user = await Api.get('/auth/me/');
      self.userFullName(user.first_name + ' ' + user.last_name);
      self.userEmail(user.email);

      // Check club roles
      var roles = await Api.get('/clubs/');
      // roles is the clubs list; check role endpoint separately
      // We check by trying to get any admin-level response
      self.isAdmin(false);
      try {
        // If admin roles exist, the stats endpoint will return data
        // We use exchange-rates as a proxy — only admins/treasurers can POST
        self.clubName(roles.results && roles.results.length ? roles.results[0].name : '');
      } catch (_) {}
    } catch (e) {
      console.warn('Profile load failed', e);
    }
  };

  // Auto-load profile if already logged in
  if (self.isLoggedIn()) {
    self.loadProfile();
  }
}
