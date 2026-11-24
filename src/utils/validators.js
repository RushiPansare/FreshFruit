export function passwordIssues(pw) {
  const issues = [];
  if (pw.length < 8) issues.push('at least 8 characters');
  if (pw.length > 64) issues.push('no more than 64 characters');
  if (!/[A-Z]/.test(pw)) issues.push('1 uppercase letter (A-Z)');
  if (!/[a-z]/.test(pw)) issues.push('1 lowercase letter (a-z)');
  if (!/[0-9]/.test(pw)) issues.push('1 number (0-9)');
  if (!/[^A-Za-z0-9\s]/.test(pw)) issues.push('1 special character (! @ # $ % ...)');
  if (/\s/.test(pw)) issues.push('no spaces');
  return issues;
}

export function passwordMessage(pw) {
  const issues = passwordIssues(pw);
  if (issues.length === 0) return '';
  const text = issues.length === 1
    ? issues[0]
    : issues.slice(0, -1).join(', ') + ' and ' + issues[issues.length - 1];
  return 'Password must contain ' + text;
}

// Filters: remove characters that are not allowed while typing
export const cleanName = (v) => v.replace(/[^A-Za-z .'-]/g, '').slice(0, 50);
export const cleanCity = (v) => v.replace(/[^A-Za-z .'-]/g, '').slice(0, 60);
export const digitsOnly = (v, max) => v.replace(/\D/g, '').slice(0, max);

// Validators: return '' when valid, otherwise the warning text
export function nameError(v, label = 'Name') {
  const t = v.trim();
  if (!t) return label + ' is required';
  if (!/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(t)) return label + ' must be 2 to 50 letters (letters, spaces, . - only)';
  return '';
}

export function cityError(v) {
  const t = v.trim();
  if (!t) return 'City is required';
  if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(t)) return 'City must be 2 to 60 letters (letters, spaces, . - only)';
  return '';
}

export function emailError(v) {
  const t = v.trim();
  if (!t) return 'Email is required';
  if (t.length > 254 || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(t)) {
    return 'Enter a valid email address (example: name@gmail.com)';
  }
  return '';
}

export function phoneError(v) {
  if (!v) return 'Mobile number is required';
  if (v.length !== 10) return 'Mobile number must be exactly 10 digits (you entered ' + v.length + ')';
  if (!/^[6-9]/.test(v)) return 'Mobile number must start with 6, 7, 8 or 9';
  return '';
}

export function pincodeError(v) {
  if (!v) return 'Pincode is required';
  if (v.length !== 6) return 'Pincode must be exactly 6 digits (you entered ' + v.length + ')';
  if (v[0] === '0') return 'Pincode cannot start with 0';
  return '';
}

export function addressError(v) {
  const t = v.trim();
  if (!t) return 'Address is required';
  if (t.length < 10) return 'Address is too short. Enter house no, street and area (at least 10 characters)';
  if (t.length > 250) return 'Address can be at most 250 characters';
  return '';
}