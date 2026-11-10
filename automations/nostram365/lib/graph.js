'use strict';
// Graph app-only API. Fail closed: API failures never authorize new accounts.
const {STUDENT_SKU, STUDENT_SKU_ID, SENDER, DOMAIN} = require('./core');

function assertConfig(env) {
  const tenant = env.NOSTRA_M365_TENANT_ID, client = env.NOSTRA_M365_CLIENT_ID;
  if (!/^[0-9a-f-]{36}$/i.test(tenant || '') || !/^[0-9a-f-]{36}$/i.test(client || '')) {
    throw new Error('ENTRA_CONFIG_MISSING');
  }
  return {tenant, client};
}
class Graph {
  constructor(env, secret) { this.env = env; this.secret = secret; this.bearer = null; }
  async token() {
    if (this.bearer) return this.bearer;
    const {tenant, client} = assertConfig(this.env);
    const params = new URLSearchParams({client_id:client, client_secret:this.secret,
      grant_type:'client_credentials', scope:'https://graph.microsoft.com/.default'});
    const response = await fetch('https://login.microsoftonline.com/' + tenant + '/oauth2/v2.0/token',
      {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:params, signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('ENTRA_TOKEN_' + response.status);
    const result = await response.json();
    if (!result.access_token) throw new Error('ENTRA_TOKEN_EMPTY');
    this.bearer = result.access_token; return this.bearer;
  }
  async call(path, options = {}) {
    const bearer = await this.token();
    const response = await fetch('https://graph.microsoft.com/v1.0' + path, {
      method:options.method || 'GET',
      headers:{Authorization:'Bearer ' + bearer, 'Content-Type':'application/json',
        ...(options.headers || {})},
      body:options.body ? JSON.stringify(options.body) : undefined,
      signal:AbortSignal.timeout(20000)
    });
    if (options.allow404 && response.status === 404) return null;
    if (!response.ok) {
      // No Graph response body in logs: it may contain personal information.
      throw new Error('GRAPH_HTTP_' + response.status);
    }
    return response.status === 204 || response.status === 202 ? null : response.json();
  }
  async findExisting(upn, name) {
    const exact = await this.call('/users/' + encodeURIComponent(upn) +
      '?$select=id,displayName,userPrincipalName', {allow404:true});
    if (exact) return exact;
    const escaped = name.replace(/'/g,"''");
    const params = new URLSearchParams({'$filter':"displayName eq '" + escaped + "'",
      '$select':'id,displayName,userPrincipalName', '$top':'10'});
    const found = await this.call('/users?' + params);
    return found && found.value && found.value.length ? found.value[0] : null;
  }
  // Never auto-create a second user when an identical full display name exists.
  // If the primary address belongs to someone else, try the approved fallback.
  async selectAvailableUpn(fullName, candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0 ||
        candidates.length > 2 || candidates.some(x => typeof x !== 'string' ||
        !/^[a-z0-9]{2,30}\.[a-z0-9]{2,31}@gruponostradamus\.edu\.pe$/.test(x))) {
      throw new Error('UPN_CANDIDATES_INVALID');
    }
    const escaped = fullName.replace(/'/g, "''");
    const params = new URLSearchParams({'$filter':"displayName eq '" + escaped + "'",
      '$select':'id,displayName,userPrincipalName', '$top':'10'});
    const matches = await this.call('/users?' + params);
    if (matches && Array.isArray(matches.value) && matches.value.length) {
      return {state:'existing_name'};
    }
    for (const upn of candidates) {
      const existing = await this.call('/users/' + encodeURIComponent(upn) +
        '?$select=id,displayName,userPrincipalName', {allow404:true});
      if (!existing) return {state:'available',upn};
    }
    return {state:'both_occupied'};
  }
  async studentSku() {
    const result = await this.call('/subscribedSkus');
    const sku = (result.value || []).find(s => s.skuPartNumber === STUDENT_SKU && s.skuId === STUDENT_SKU_ID);
    if (!sku || sku.capabilityStatus !== 'Enabled') throw new Error('STUDENT_A1_SKU_UNAVAILABLE');
    const enabled = Number(sku.prepaidUnits && sku.prepaidUnits.enabled || 0);
    const consumed = Number(sku.consumedUnits || 0);
    if (Number.isFinite(enabled) && enabled > 0 && consumed >= enabled) throw new Error('STUDENT_A1_NO_SEATS');
    return sku.skuId;
  }
  async createStudent(upn, displayName, password) {
    return this.call('/users', {method:'POST', body:{
      accountEnabled:true, displayName, mailNickname:upn.split('@')[0],
      userPrincipalName:upn, usageLocation:'PE',
      passwordProfile:{forceChangePasswordNextSignIn:true, password}
    }});
  }
  async licenseStudent(id, skuId) {
    return this.call('/users/' + encodeURIComponent(id) + '/assignLicense', {
      method:'POST', body:{addLicenses:[{skuId, disabledPlans:[]}],removeLicenses:[]}});
  }
  async mailStudent(to, subject, content) {
    if (!to || !to.includes('@') || to.toLowerCase().endsWith('@' + DOMAIN)) throw new Error('PERSONAL_EMAIL_INVALID');
    // Exchange Online Application RBAC must restrict Application Mail.Send to this mailbox.
    await this.call('/users/' + encodeURIComponent(SENDER) + '/sendMail', {
      method:'POST', body:{message:{subject,
        body:{contentType:'Text',content},
        toRecipients:[{emailAddress:{address:to}}]}, saveToSentItems:true}});
  }
}
module.exports = {Graph,assertConfig};