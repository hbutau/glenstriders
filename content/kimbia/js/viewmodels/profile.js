/**
 * Profile ViewModel — view and update the logged-in user's profile,
 * and change their password.
 */
function ProfileViewModel(app) {
  var self = this;

  self.loading = ko.observable(false);
  self.saving = ko.observable(false);
  self.error = ko.observable('');
  self.success = ko.observable('');

  // Editable profile fields
  self.email = ko.observable('');
  self.firstName = ko.observable('');
  self.lastName = ko.observable('');
  self.phone = ko.observable('');
  self.dateOfBirth = ko.observable('');
  self.emergencyContactName = ko.observable('');
  self.emergencyContactPhone = ko.observable('');
  self.idNumber = ko.observable('');
  self.gender = ko.observable('');
  self.address = ko.observable('');
  self.vestSize = ko.observable('');
  self.tshirtSize = ko.observable('');
  self.personalBest10k = ko.observable('');
  self.allergiesDietaryPreferences = ko.observable('');
  self.photoConsent = ko.observable(false);

  // Change password form
  self.passwordError = ko.observable('');
  self.passwordSuccess = ko.observable('');
  self.changingPassword = ko.observable(false);
  self.oldPassword = ko.observable('');
  self.newPassword = ko.observable('');
  self.newPasswordConfirm = ko.observable('');

  self.load = async function () {
    self.loading(true);
    self.error('');
    self.success('');
    try {
      var user = await Api.get('/auth/me/');
      self.email(user.email || '');
      self.firstName(user.first_name || '');
      self.lastName(user.last_name || '');
      self.phone(user.phone || '');
      self.dateOfBirth(user.date_of_birth || '');
      self.emergencyContactName(user.emergency_contact_name || '');
      self.emergencyContactPhone(user.emergency_contact_phone || '');
      self.idNumber(user.id_number || '');
      self.gender(user.gender || '');
      self.address(user.address || '');
      self.vestSize(user.vest_size || '');
      self.tshirtSize(user.tshirt_size || '');
      self.personalBest10k(user.personal_best_10k_minutes || '');
      self.allergiesDietaryPreferences(user.allergies_dietary_preferences || '');
      self.photoConsent(!!user.photo_consent);
    } catch (e) {
      self.error('Failed to load profile: ' + e.message);
    } finally {
      self.loading(false);
    }
  };

  self.save = async function () {
    self.error('');
    self.success('');
    self.saving(true);
    try {
      var user = await Api.patch('/auth/me/', {
        first_name: self.firstName(),
        last_name: self.lastName(),
        phone: self.phone(),
        date_of_birth: self.dateOfBirth() || null,
        emergency_contact_name: self.emergencyContactName(),
        emergency_contact_phone: self.emergencyContactPhone(),
        id_number: self.idNumber(),
        gender: self.gender(),
        address: self.address(),
        vest_size: self.vestSize(),
        tshirt_size: self.tshirtSize(),
        personal_best_10k_minutes: self.personalBest10k(),
        allergies_dietary_preferences: self.allergiesDietaryPreferences(),
        photo_consent: self.photoConsent(),
      });
      self.success('Profile updated successfully.');
      // Keep the sidebar name/email in sync
      if (app && app.auth) {
        app.auth.userFullName(user.first_name + ' ' + user.last_name);
        app.auth.userEmail(user.email);
      }
    } catch (e) {
      self.error('Failed to update profile: ' + e.message);
    } finally {
      self.saving(false);
    }
  };

  self.changePassword = async function () {
    self.passwordError('');
    self.passwordSuccess('');
    if (self.newPassword() !== self.newPasswordConfirm()) {
      self.passwordError('New passwords do not match.');
      return;
    }
    self.changingPassword(true);
    try {
      await Api.post('/auth/change-password/', {
        old_password: self.oldPassword(),
        new_password: self.newPassword(),
      });
      self.passwordSuccess('Password changed successfully.');
      self.oldPassword('');
      self.newPassword('');
      self.newPasswordConfirm('');
    } catch (e) {
      self.passwordError('Failed to change password: ' + e.message);
    } finally {
      self.changingPassword(false);
    }
  };
}
