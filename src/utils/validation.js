export const isRequired = (value, message = 'This field is required') => {
	if (value === null || value === undefined) return message;
	if (typeof value === 'string' && value.trim() === '') return message;
	if (Array.isArray(value) && value.length === 0) return message;
	return '';
};

export const isEmail = (value, message = 'Please enter a valid email address') => {
	if (!value) return 'Email is required';
	const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return emailRegex.test(String(value)) ? '' : message;
};

export const passwordStrength = (value, opts = {}) => {
	const {
		minLength = 8,
		maxLength = 128,
		requireLower = true,
		requireUpper = true,
		requireNumber = true,
		requireSpecial = true,
	} = opts;

	if (!value) return 'Password is required';
	if (value.length < minLength) return `Password must be at least ${minLength} characters long`;
	if (value.length > maxLength) return `Password must be less than ${maxLength} characters`;
	if (requireLower && !/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
	if (requireUpper && !/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
	if (requireNumber && !/\d/.test(value)) return 'Password must contain at least one number';
	if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return 'Password must contain at least one special character';
	return '';
};

export const minLength = (value, min, message) => {
	if ((value || '').trim().length < min) return message || `Must be at least ${min} characters`;
	return '';
};

export const maxLength = (value, max, message) => {
	if ((value || '').trim().length > max) return message || `Must be at most ${max} characters`;
	return '';
};

export const nameValidator = (value, { min = 2, max = 50 } = {}) => {
	if (!value || value.trim() === '') return 'Full name is required';
	if (value.trim().length < min) return `Name must be at least ${min} characters long`;
	if (value.trim().length > max) return `Name must be less than ${max} characters`;
	
	// Check for numbers
	if (/\d/.test(value)) return 'Name cannot contain numbers';
	
	// Check for special characters (only allow letters, spaces, hyphens, apostrophes, and periods)
	const nameRegex = /^[a-zA-Z\s'.-]+$/;
	if (!nameRegex.test(value.trim())) return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
	
	// Check for consecutive spaces
	if (/\s{2,}/.test(value)) return 'Name cannot have consecutive spaces';
	
	// Check for leading/trailing spaces
	if (value !== value.trim()) return 'Name cannot have leading or trailing spaces';
	
	// Check for minimum word count (at least first and last name)
	const words = value.trim().split(/\s+/);
	if (words.length < 2) return 'Please enter your full name (first and last name)';
	
	// Check each word starts with a letter
	for (const word of words) {
		if (!/^[a-zA-Z]/.test(word)) return 'Each name part must start with a letter';
	}
	
	return '';
};

// Validates international phone numbers constrained to specific country codes.
// Default allowed: +91 (India) and +81 (Japan). Accepts optional spaces, dashes, or parentheses.
export const phoneValidator = (
	value,
	{
		allowedCountryCodes = ['+91', '+81'],
		allowLocalTenDigit = false,
		message = 'Please enter a valid phone number'
	} = {}
) => {
	if (!value || value.trim() === '') return 'Phone number is required';

	// Normalize the input by removing spaces, dashes and parentheses for validation
	const normalized = String(value).replace(/[\s\-()]/g, '');

	// Must start with one of the allowed country codes and be followed by 10 digits
	const internationalPattern = new RegExp(
		`^(${allowedCountryCodes.map(cc => cc.replace('+', '\\+')).join('|')})\\d{10}$`
	);

	// Optionally allow local 10-digit numbers (e.g., India without +91)
	const localPattern = /^\d{10}$/;

	const isValid = internationalPattern.test(normalized) || (allowLocalTenDigit && localPattern.test(normalized));

	return isValid ? '' : message;
};

// Date of birth validation with age restrictions
export const dateOfBirthValidator = (value, { minAge = 18, maxAge = 65 } = {}) => {
	if (!value) return 'Date of birth is required';
	
	const birthDate = new Date(value);
	const today = new Date();
	const age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	
	// Adjust age if birthday hasn't occurred this year
	const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
		? age - 1 
		: age;
	
	// Check if date is valid
	if (isNaN(birthDate.getTime())) return 'Please enter a valid date';
	
	// Check if date is in the future
	if (birthDate > today) return 'Date of birth cannot be in the future';
	
	// Check age limits
	if (actualAge < minAge) return `You must be at least ${minAge} years old to apply`;
	if (actualAge > maxAge) return `Age limit is ${maxAge} years for this position`;
	
	// Check if date is too far in the past (reasonable limit)
	const minDate = new Date();
	minDate.setFullYear(today.getFullYear() - 100);
	if (birthDate < minDate) return 'Please enter a valid date of birth';
	
	return '';
};

export const pincodeValidator = (value, message = 'Please enter a valid 6-digit pincode') => {
	if (!value || value.trim() === '') return 'Pincode is required';
	const pinRegex = /^\d{6}$/;
	return pinRegex.test(value.trim()) ? '' : message;
};

export const numericValidator = (value, { allowEmpty = false, min = null, max = null } = {}) => {
	if ((value === '' || value === null || value === undefined) && allowEmpty) return '';
	if (value === '' || value === null || value === undefined) return 'This field is required';
	const num = Number(value);
	if (Number.isNaN(num)) return 'Please enter a valid number';
	if (min !== null && num < min) return `Must be at least ${min}`;
	if (max !== null && num > max) return `Must be at most ${max}`;
	return '';
};

export const enumValidator = (value, allowed, message = 'Invalid selection') => {
	if (!allowed.includes(value)) return message;
	return '';
};

export const fileValidator = (file, { maxBytes = 5 * 1024 * 1024, mimeTypes = [] } = {}) => {
	if (!file) return 'File is required';
	if (file.size > maxBytes) return `File size must be less than ${Math.round(maxBytes / (1024 * 1024))}MB`;
	if (mimeTypes.length && !mimeTypes.includes(file.type)) return `Invalid file type. Allowed: ${mimeTypes.join(', ')}`;
	return '';
};

export const validateSchema = (values, schema) => {
	// schema: { fieldName: [(v)=>error, ...] }
	const errors = {};
	Object.keys(schema).forEach((field) => {
		const validators = Array.isArray(schema[field]) ? schema[field] : [schema[field]];
		for (const validator of validators) {
			const error = validator(values[field], values);
			if (error) {
				errors[field] = error;
				break;
			}
		}
	});
	return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;

