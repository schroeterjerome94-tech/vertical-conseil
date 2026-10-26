export function proTitle(asce: boolean) {
  return asce ? "Version Pro" : "Abonnement Pro";
}

export function proCta(asce: boolean) {
  return asce ? "Passer à la version Pro" : "Passer l’abonnement Pro";
}

export function proLockedPart(asce: boolean) {
  return asce
    ? "Cette partie fait partie de la version Pro."
    : "Cette partie fait partie de l’abonnement Pro.";
}
