#!/usr/bin/env bash
# Opt-in go-live for NostraM365 ONLY. Real approved+paid enrollments are processed.
set -Eeuo pipefail
PROJECT=nostrachat-grupo-nostradamus
cd "$(dirname "${BASH_SOURCE[0]}")/.."
if [[ "${1:-}" != "--activate" ]]; then
  echo "Uso: bash scripts/go-live.sh --activate"
  echo "Atencion: crea cuentas M365 reales para nuevas matriculas aprobadas+pagadas."
  exit 2
fi
command -v jq >/dev/null
command -v gcloud >/dev/null
command -v firebase >/dev/null
[[ -f .env ]] || { echo "Falta .env"; exit 2; }

echo "[1/4] Pruebas y estado seguro actual"
npm test
node <<'NODE'
const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/)
  .filter(x=>x.includes('=')&&!x.startsWith('#'))
  .map(x=>[x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)]));
const expected={NOSTRA_M365_ENABLED:'false',NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED:'false',
  NOSTRA_M365_SCOPE_MODE:'pilot',NOSTRA_M365_NOT_BEFORE:'2099-01-01T00:00:00Z',
  NOSTRA_M365_PILOT_ACTIVATION_ENABLED:'true'};
const errors=Object.entries(expected).filter(([k,v])=>env[k]!==v);
if(errors.length) throw Error('Configuracion piloto inesperada: '+errors.map(x=>x[0]).join(', '));
if(!/^[0-9a-f-]{36}$/i.test(env.NOSTRA_M365_TENANT_ID||'') ||
   !/^[0-9a-f-]{36}$/i.test(env.NOSTRA_M365_CLIENT_ID||'')) throw Error('Ids Entra invalidos');
console.log('PASS: inicio desde piloto desactivado');
NODE

for pair in "nostraM365Alta nostram365-alta" "nostraM365Activar nostram365-activar"; do
  read -r name sa <<<"$pair"
  gcloud functions describe "$name" --gen2 --region us-central1 --project "$PROJECT" --format json |
    jq -e --arg sa "$sa@$PROJECT.iam.gserviceaccount.com" \
    '.serviceConfig.serviceAccountEmail==$sa and
     .serviceConfig.environmentVariables.NOSTRA_M365_ENABLED=="false"' >/dev/null || {
       echo "Función $name en estado inesperado; se aborta"; exit 2; }
done
gcloud functions describe nostraM365Alta --gen2 --region us-central1 --project "$PROJECT" \
  --format json | jq -e '.eventTrigger.eventType=="google.cloud.firestore.document.v1.updated"' >/dev/null || {
    echo "Disparador Firestore no reconocido"; exit 2; }

backup=".env.nostram365-before-production-$(date -u +%Y%m%dT%H%M%SZ)"
cp .env "$backup"
chmod 600 "$backup"
cutoff="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export NOSTRA_PROD_CUTOFF="$cutoff"

echo "[2/4] Preparacion del inicio UTC: $cutoff"
node <<'NODE'
const fs=require('fs');
const changes={
  NOSTRA_M365_ENABLED:'true',
  NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED:'true',
  NOSTRA_M365_SCOPE_MODE:'production',
  NOSTRA_M365_NOT_BEFORE:process.env.NOSTRA_PROD_CUTOFF,
  NOSTRA_M365_PILOT_ACTIVATION_ENABLED:'false'
};
const lines=fs.readFileSync('.env','utf8').split(/\r?\n/).filter(x=>x.trim() &&
  !Object.keys(changes).some(k=>x.startsWith(k+'=')));
fs.writeFileSync('.env',lines.concat(Object.entries(changes).map(([k,v])=>k+'='+v)).join('\n')+'\n',{mode:0o600});
NODE

rollback() {
  trap - ERR
  set +e
  echo "ERROR: restaurando configuracion piloto y reimplantando SOLO NostraM365..."
  cp "$backup" .env
  firebase deploy --config firebase.json --only functions:nostram365 --project "$PROJECT"
  if [[ $? -ne 0 ]]; then
    echo "ALERTA CRITICA: no se pudo confirmar la reversion; requiere revisar NostraM365."
  else
    echo "Version piloto apagada restaurada."
  fi
  exit 1
}
trap rollback ERR

echo "[3/4] Despliegue selectivo, sin tocar Culqi, asistencia o NostraLAB"
firebase deploy --config firebase.json --only functions:nostram365 --project "$PROJECT"

echo "[4/4] Validacion de configuracion final"
for name in nostraM365Alta nostraM365Activar; do
  gcloud functions describe "$name" --gen2 --region us-central1 --project "$PROJECT" --format json |
    jq -e --arg cutoff "$cutoff" \
    '(.serviceConfig.environmentVariables.NOSTRA_M365_ENABLED=="true") and
     (.serviceConfig.environmentVariables.NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED=="true") and
     (.serviceConfig.environmentVariables.NOSTRA_M365_SCOPE_MODE=="production") and
     (.serviceConfig.environmentVariables.NOSTRA_M365_NOT_BEFORE==$cutoff)' >/dev/null
done
trap - ERR
echo "NOSTRAM365_ACTIVADO: nuevas transiciones de matrícula aprobada + pago validado."
echo "Corte UTC: $cutoff; SIN retroactividad."
echo "Respaldo local .env: $backup"
echo "No borres los trabajos privados si alguna cuenta requiere revision."
