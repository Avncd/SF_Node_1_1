var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var ContactForm = new keystone.List('ContactForm', {
	nocreate: true,
	noedit: true,
});

ContactForm.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
	ContactFormType: { type: Types.Select, options: [
		{ value: 'message', label: 'Just leaving a message' },
		{ value: 'question', label: 'I\'ve got a question' },
		{ value: 'other', label: 'Something else...' },
		{ value: 'product', label: 'Ask about a product' },
	] },
	message: { type: Types.Markdown, required: true },
	createdAt: { type: Date, default: Date.now },
});

ContactForm.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

ContactForm.schema.post('save', function () {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

ContactForm.schema.methods.sendNotificationEmail = function (callback) {
	if (typeof callback !== 'function') {
		callback = function (err) {
			if (err) {
				console.error('There was an error sending the notification email:', err);
			}
		};
	}

	if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
		console.log('Unable to send email - no mailgun credentials provided');
		return callback(new Error('could not find mailgun credentials'));
	}

	var ContactForm = this;
	var brand = keystone.get('brand');

	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
		if (err) return callback(err);
		new keystone.Email({
			templateName: 'enquiry-notification',
			transport: 'mailgun',
		}).send({
			to: admins,
			from: {
				name: 'SailFuture',
				email: 'contact@sailfuture.com',
			},
			subject: 'New Enquiry for SailFuture',
			ContactForm: ContactForm,
			brand: brand,
			layout: false,
		}, callback);
	});
};

ContactForm.defaultSort = '-createdAt';
ContactForm.defaultColumns = 'name, email, ContactFormType, createdAt';
ContactForm.register();
