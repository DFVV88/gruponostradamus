/* Vista administrativa: fuente de identidad en el documento oficial seleccionado.
   NO autoriza automáticamente la asociación: el backend valida ambos registros. */
export function identityFromSelectedRecords(account, enrollment){
  const rawDni=String(enrollment?.dni??'').trim();
  const dni=/^\d{8,12}$/.test(rawDni)?rawDni:'';
  const email=String(account?.institutionalEmail??'').trim().toLowerCase();
  return {
    dni,
    email:/^[^\s@]+@gruponostradamus\.edu\.pe$/.test(email)?email:'',
    dniFromRecord:Boolean(enrollment),
    emailFromAccount:Boolean(account)
  };
}
