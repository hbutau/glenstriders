/**
 * Notifications ViewModel.
 */
function NotificationsViewModel(app) {
  var self = this;

  self.notifications = ko.observableArray([]);
  self.unreadCount = ko.observable(0);

  self.load = async function () {
    try {
      var data = await Api.get('/notifications/');
      var list = data.results || data;
      self.notifications(list);
      self.unreadCount(list.filter(function (n) { return !n.is_read; }).length);
    } catch (e) {
      console.error('Notifications load failed', e);
    }
  };

  self.markRead = async function (notification) {
    try {
      var updated = await Api.post('/notifications/' + notification.id + '/read/', {});
      self.load();
    } catch (e) {
      console.error('Mark read failed', e);
    }
  };

  self.markAllRead = async function () {
    try {
      await Api.post('/notifications/read_all/', {});
      self.load();
    } catch (e) {
      console.error('Mark all read failed', e);
    }
  };
}
