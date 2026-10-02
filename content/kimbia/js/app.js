/**
 * Kimbia — Knockout.js Application Bootstrap
 *
 * Initialises all ViewModels and binds the root ViewModel to #app.
 * Navigation is handled by setting `currentView` and calling `load()`
 * on the corresponding ViewModel.
 */
(function () {
  'use strict';

  function AppViewModel() {
    var self = this;

    self.currentView = ko.observable('dashboard');

    // ----------------------------------------------------------------
    // Instantiate sub-ViewModels
    // ----------------------------------------------------------------
    self.auth         = new AuthViewModel(self);
    self.dashboard    = new DashboardViewModel(self);
    self.events       = new EventsViewModel(self);
    self.membership   = new MembershipViewModel(self);
    self.payments     = new PaymentsViewModel(self);
    self.notifications = new NotificationsViewModel(self);
    self.adminMembers  = new AdminMembersViewModel(self);
    self.adminFinances = new AdminFinancesViewModel(self);
    self.adminPlans    = new AdminPlansViewModel(self);
    self.exchangeRate  = new ExchangeRateViewModel(self);

    // ----------------------------------------------------------------
    // Navigation helpers
    // ----------------------------------------------------------------
    function navigate(view, vm) {
      return function () {
        self.currentView(view);
        if (vm && typeof vm.load === 'function') vm.load();
      };
    }

    self.showDashboard      = navigate('dashboard',      self.dashboard);
    self.showEvents         = navigate('events',         self.events);
    self.showMembership     = navigate('membership',     self.membership);
    self.showPayments       = navigate('payments',       self.payments);
    self.showNotifications  = navigate('notifications',  self.notifications);
    self.showAdminMembers   = navigate('admin-members',  self.adminMembers);
    self.showAdminFinances  = navigate('admin-finances', self.adminFinances);
    self.showAdminPlans     = navigate('admin-plans',    self.adminPlans);
    self.showExchangeRate   = navigate('exchange-rate',  self.exchangeRate);

    // ----------------------------------------------------------------
    // Auto-load dashboard when user logs in
    // ----------------------------------------------------------------
    self.auth.isLoggedIn.subscribe(function (loggedIn) {
      if (loggedIn) {
        self.showDashboard();
        self.notifications.load();
      }
    });

    // ----------------------------------------------------------------
    // Initial load if already authenticated
    // ----------------------------------------------------------------
    if (self.auth.isLoggedIn()) {
      self.dashboard.load();
      self.notifications.load();
    }
  }

  // ----------------------------------------------------------------
  // Boot
  // ----------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    var appEl = document.getElementById('app');
    if (!appEl) return;

    var vm = new AppViewModel();
    ko.applyBindings(vm, appEl);
    appEl.style.display = '';  // reveal the app
  });
})();
