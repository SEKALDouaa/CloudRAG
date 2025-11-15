function PasswordStrengthIndicator({ password }) {
  const calculateStrength = () => {
    let strength = 0;
    if (!password) return { score: 0, text: '', color: '' };

    // Longueur
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Complexité
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { score: 1, text: 'Faible', color: 'bg-red-500' };
    } else if (strength <= 4) {
      return { score: 2, text: 'Moyen', color: 'bg-yellow-500' };
    } else {
      return { score: 3, text: 'Fort', color: 'bg-green-500' };
    }
  };

  const strength = calculateStrength();

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength.score ? strength.color : 'bg-gray-600'
            }`}
          ></div>
        ))}
      </div>
      <p className={`text-xs ${
        strength.score === 1 ? 'text-red-400' :
        strength.score === 2 ? 'text-yellow-400' :
        'text-green-400'
      }`}>
        Mot de passe {strength.text}
      </p>
    </div>
  );
}

export default PasswordStrengthIndicator;
