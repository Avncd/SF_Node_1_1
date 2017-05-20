var keystone = require('keystone');
var ContactForm = keystone.list('ContactForm');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'ContactForm';
	locals.ContactFormTypes = ContactForm.fields.ContactFormType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.ContactFormSubmitted = false;

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'ContactForm' }, function (next) {

		var newContactFormType = new ContactFormType.model();
		var updater = newContactForm.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, ContactFormType, message',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.ContactFormSubmitted = true;
			}
			next();
		});
	});

	view.render('ContactForm');
};
