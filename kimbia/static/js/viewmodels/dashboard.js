/**
 * Dashboard ViewModel — stats, announcements, upcoming events.
 */
function DashboardViewModel(app) {
  var self = this;

  self.stats = {
    active_members: ko.observable(null),
    upcoming_events: ko.observable(null),
    revenue_this_month_transactions: ko.observable(null),
  };
  self.announcements = ko.observableArray([]);
  self.upcomingEvents = ko.observableArray([]);

  self.load = async function () {
    try {
      // Stats — only works for admin, silently ignored otherwise
      var clubs = await Api.get('/clubs/');
      var clubList = clubs.results || clubs;
      if (clubList.length) {
        try {
          var stats = await Api.get('/clubs/' + clubList[0].id + '/stats/');
          self.stats.active_members(stats.active_members);
          self.stats.upcoming_events(stats.upcoming_events);
          self.stats.revenue_this_month_transactions(stats.revenue_this_month_transactions);
        } catch (_) {}
      }
    } catch (_) {}

    try {
      var ann = await Api.get('/announcements/');
      self.announcements((ann.results || ann).slice(0, 5));
    } catch (_) {}

    try {
      var evts = await Api.get('/events/?status=published');
      self.upcomingEvents((evts.results || evts).slice(0, 5));
    } catch (_) {}
  };
}
