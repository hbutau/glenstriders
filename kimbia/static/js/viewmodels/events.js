/**
 * Events ViewModel — list, create, RSVP, check-in.
 */
function EventsViewModel(app) {
  var self = this;

  self.events = ko.observableArray([]);
  self.loading = ko.observable(false);
  self.saving = ko.observable(false);
  self.filterType = ko.observable('');
  self.selectedEvent = ko.observable(null);

  self.newEvent = {
    title: ko.observable(''),
    event_type: ko.observable('training_run'),
    location: ko.observable(''),
    start_time: ko.observable(''),
    distance_km: ko.observable(''),
    fee_usd: ko.observable(0),
    max_participants: ko.observable(''),
    description: ko.observable(''),
  };

  self.load = async function () {
    self.loading(true);
    try {
      var url = '/events/';
      var params = [];
      if (self.filterType()) params.push('event_type=' + self.filterType());
      if (params.length) url += '?' + params.join('&');
      var data = await Api.get(url);
      self.events(data.results || data);
    } catch (e) {
      console.error('Events load failed', e);
    } finally {
      self.loading(false);
    }
  };

  self.viewEvent = function (event) {
    self.selectedEvent(event);
    var modal = new bootstrap.Modal(document.getElementById('eventDetailModal'));
    modal.show();
  };

  self.rsvp = async function (event) {
    try {
      await Api.post('/events/' + event.id + '/rsvp/', {});
      alert('RSVP confirmed for ' + event.title + '!');
      self.load();
    } catch (e) {
      alert('RSVP failed: ' + e.message);
    }
  };

  self.openCreateModal = function () {
    // reset form
    Object.keys(self.newEvent).forEach(function (k) { self.newEvent[k](''); });
    self.newEvent.event_type('training_run');
    self.newEvent.fee_usd(0);
    var modal = new bootstrap.Modal(document.getElementById('createEventModal'));
    modal.show();
  };

  self.createEvent = async function () {
    self.saving(true);
    try {
      var payload = {
        title: self.newEvent.title(),
        event_type: self.newEvent.event_type(),
        location: self.newEvent.location(),
        start_time: self.newEvent.start_time(),
        fee_usd: self.newEvent.fee_usd() || 0,
        description: self.newEvent.description(),
        status: 'draft',
      };
      if (self.newEvent.distance_km()) payload.distance_km = parseFloat(self.newEvent.distance_km());
      if (self.newEvent.max_participants()) payload.max_participants = parseInt(self.newEvent.max_participants());

      await Api.post('/events/', payload);
      bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
      self.load();
    } catch (e) {
      alert('Create event failed: ' + e.message);
    } finally {
      self.saving(false);
    }
  };
}
