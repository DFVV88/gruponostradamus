#!/usr/bin/env bash
# Emergency stop: no new M365 users; keep password activation available.
set -Eeuo pipefail
PROJECT=nostrachat-grupo-nostradamus
cd "$(dirname "${BASH_SOURCE[0]}")/.."
bash -n scripts/maintenance.sh
[[ "${1:-}" == "--stop" ]] || { echo "Uso: bash scripts/maintenance.sh --stop"; exit 2; }
[[ -f .env ]] || { echo "No se encuentra .env"; exit 2; }

node <<'NODE'
const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/)
 .filter(x=>x.includes('=')&&!x.startsWith('#'))
 .map(x=>[x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)]));
if(env.NOSTRA_M365_ENABLED!=='true' || env.NOSTRA_M365_EXCHANGE_SCOPE_VERIFIED!=='true' ||
   !['production','maintenance'].includes(env.NOSTRA_M365_SCOPE_MODE))
  throw Error('Configuracion inesperada: no se aplica cambio');
NODE

backup=".env.maintenance-backup-$(date -u +%Y%m%dT%H%M%SZ)"
cp .env "$backup"
chmod 600 "$backup"

node <<'NODE'
const fs=require('fs');
const lines=fs.readFileSync('.env','utf8').split(/\r?\n/)
  .filter(x=>x.trim()&&!x.startsWith('NOSTRA_M365_SCOPE_MODE='));
fs.writeFileSync('.env',lines.concat('NOSTRA_M365_SCOPE_MODE=maintenance').join('\n')+'\n',{mode:0o600});
NODE

echo "Deteniendo nuevas altas; manteniendo la consulta de claves temporales."
if ! firebase deploy --config firebase.json --only functions:nostram365 --project "$PROJECT"; then
  echo "ALERTA: despliegue incompleto. Verificar estado real de ambas funciones."
  exit 1
fi
for name in nostraM365Alta nostraM365Activar; do
  gcloud functions describe "$name" --gen2 --region us-central1 --project "$PROJECT" --format json |
    jq -e '(.serviceConfig.environmentVariables.NOSTRA_M365_SCOPE_MODE=="maintenance") and
      (.serviceConfig.environmentVariables.NOSTRA_M365_ENABLED=="true")' >/dev/null
done
echo "MANTENIMIENTO ACTIVO: nuevas altas bloqueadas; contraseñas ya enviadas siguen accesibles."
echo "Respaldo .env: $backup"
