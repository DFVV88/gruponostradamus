'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {Graph, assertConfig} = require('../lib/graph');

const env = {NOSTRA_M365_TENANT_ID:'23b6326f-b776-4ffd-8b1d-cd9d10e38d84',
  NOSTRA_M365_CLIENT_ID:'274c5902-7821-4b9a-b74c-165bd487f0a9'};
function mocked(routes, fn) {
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url, opts) => {
    calls.push({url:String(url), opts});
    if (String(url).includes('/oauth2/v2.0/token')) {
      return new Response(JSON.stringify({access_token:'mock-only'}),{status:200});
    }
    for (const r of routes) if (String(url).includes(r.path)) {
      return new Response(r.body == null ? null : JSON.stringify(r.body),{status:r.status});
    }
    throw new Error('UNEXPECTED_REQUEST');
  };
  return Promise.resolve().then(()=>fn(calls)).finally(()=>{global.fetch=original;});
}
test('configuration rejects non-GUID client IDs', () => {
  assert.throws(()=>assertConfig({...env,NOSTRA_M365_CLIENT_ID:'abc'}));
});
test('Graph blocks license not exactly A1 for students', async () => {
  await mocked([{path:'/subscribedSkus',status:200,body:{value:[
    {skuPartNumber:'STANDARDWOFFPACK_FACULTY',skuId:'other',capabilityStatus:'Enabled'}]}}],
  async () => {
    const graph = new Graph(env,'client-secret-mock');
    await assert.rejects(()=>graph.studentSku(),/STUDENT_A1_SKU_UNAVAILABLE/);
  });
});
test('Graph uses only Informes sender and one student license SKU', async () => {
  await mocked([
    {path:'/subscribedSkus',status:200,body:{value:[{skuPartNumber:'STANDARDWOFFPACK_STUDENT',
      skuId:'314c4481-f395-4525-be8b-2ec4bb1e9d91',capabilityStatus:'Enabled',
      prepaidUnits:{enabled:100},consumedUnits:15}]}},
    {path:'/assignLicense',status:200,body:{id:'new-id'}},
    {path:'/sendMail',status:202,body:null}
  ], async calls => {
    const graph = new Graph(env,'client-secret-mock');
    const sku = await graph.studentSku();
    assert.equal(sku,'314c4481-f395-4525-be8b-2ec4bb1e9d91');
    await graph.licenseStudent('new-id',sku);
    await graph.mailStudent('alumno@example.com','Bienvenido','Texto');
    const licensing = calls.find(c=>c.url.includes('assignLicense'));
    assert.equal(JSON.parse(licensing.opts.body).addLicenses[0].skuId,sku);
    const send = calls.find(c=>c.url.includes('sendMail'));
    assert.match(send.url,/informes%40gruponostradamus\.edu\.pe\/sendMail/);
  });
});
test('Graph failure does not become absent user', async () => {
  await mocked([{path:'/users/',status:403,body:{error:{code:'Authorization_RequestDenied'}}}],
  async () => {
    const graph = new Graph(env,'client-secret-mock');
    await assert.rejects(()=>graph.findExisting('x@gruponostradamus.edu.pe','Alumno X'),
      /GRAPH_HTTP_403/);
  });
});

test('selectAvailableUpn prefers primary when free', async () => {
  await mocked([
    {path:'/users?',status:200,body:{value:[]}},
    {path:'/users/luis.perez%40',status:404,body:{error:{}}}
  ], async calls => {
    const graph = new Graph(env,'mock');
    const choice = await graph.selectAvailableUpn('Luis Alberto Pérez García',[
      'luis.perez@gruponostradamus.edu.pe','luis.perezg@gruponostradamus.edu.pe']);
    assert.deepEqual(choice,{state:'available',upn:'luis.perez@gruponostradamus.edu.pe'});
    assert.equal(calls.filter(x => x.url.includes('/users/luis.perezg%40')).length,0);
  });
});
test('selectAvailableUpn uses second surname initial when primary is occupied', async () => {
  await mocked([
    {path:'/users?',status:200,body:{value:[]}},
    {path:'/users/luis.perezg%40',status:404,body:{error:{}}},
    {path:'/users/luis.perez%40',status:200,body:{id:'existing-primary',displayName:'Otro Alumno'}}
  ], async () => {
    const graph = new Graph(env,'mock');
    assert.deepEqual(await graph.selectAvailableUpn('Luis Alberto Pérez García',[
      'luis.perez@gruponostradamus.edu.pe','luis.perezg@gruponostradamus.edu.pe']),
    {state:'available',upn:'luis.perezg@gruponostradamus.edu.pe'});
  });
});
test('selectAvailableUpn stops on exact display name or two taken addresses', async () => {
  await mocked([{path:'/users?',status:200,body:{value:[{id:'manual',displayName:'Luis Alberto Pérez García'}]}}],
    async () => {
      const graph = new Graph(env,'mock');
      assert.deepEqual(await graph.selectAvailableUpn('Luis Alberto Pérez García',[
        'luis.perez@gruponostradamus.edu.pe','luis.perezg@gruponostradamus.edu.pe']),
      {state:'existing_name'});
    });
  await mocked([
    {path:'/users?',status:200,body:{value:[]}},
    {path:'/users/luis.perezg%40',status:200,body:{id:'second'}},
    {path:'/users/luis.perez%40',status:200,body:{id:'first'}}
  ], async () => {
    const graph = new Graph(env,'mock');
    assert.deepEqual(await graph.selectAvailableUpn('Luis Alberto Pérez García',[
      'luis.perez@gruponostradamus.edu.pe','luis.perezg@gruponostradamus.edu.pe']),
    {state:'both_occupied'});
  });
});
test('selectAvailableUpn fails closed on Graph errors', async () => {
  await mocked([{path:'/users?',status:403,body:{error:{}}}], async () => {
    const graph = new Graph(env,'mock');
    await assert.rejects(()=>graph.selectAvailableUpn('Luis Alberto Pérez García',[
      'luis.perez@gruponostradamus.edu.pe']), /GRAPH_HTTP_403/);
  });
});
