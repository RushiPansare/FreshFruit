import { passwordIssues, passwordMessage } from '../utils/validators';

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const n = passwordIssues(password).length;
  const level = n === 0 ? 'strong' : n <= 2 ? 'medium' : 'weak';
  const label = { strong: 'Strong password', medium: 'Medium password', weak: 'Weak password' }[level];

  return (
    <div className='pw-meter'>
      <div className='pw-bar'><div className={'pw-fill ' + level} /></div>
      <span className={'pw-label ' + level}>{label}</span>
      {n > 0 && <p className='field-error'>{passwordMessage(password)}</p>}
    </div>
  );
}