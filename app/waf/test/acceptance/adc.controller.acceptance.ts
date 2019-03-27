// Copyright F5 Networks, Inc. 2018. All Rights Reserved.
// Node module: @loopback/example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {setupApplication, teardownApplication} from '../helpers/test-helper';
import {
  givenEmptyDatabase,
  givenAdcData,
  createAdcObject,
} from '../helpers/database.helpers';
import {Adc} from '../../src/models';
import uuid = require('uuid');

describe('AdcController', () => {
  let wafapp: WafApplication;
  let client: Client;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    ({wafapp, client} = await setupApplication());
  });
  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
  });

  it('post ' + prefix + '/adcs: with id', async () => {
    const adc = new Adc(createAdcObject({id: uuid()}));

    const response = await client
      .post(prefix + '/adcs')
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('post ' + prefix + '/adcs: with no id', async () => {
    const adc = new Adc(createAdcObject());

    const response = await client
      .post(prefix + '/adcs')
      .send(adc)
      .expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('post ' + prefix + '/adcs: with duplicate id', async () => {
    const adc = await givenAdcData(wafapp);

    await client
      .post(prefix + '/adcs')
      .send(adc)
      .expect(400);
  });

  it('get ' + prefix + '/adcs: of all', async () => {
    const adc = await givenAdcData(wafapp);

    let response = await client
      .get(prefix + '/adcs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs: with filter string', async () => {
    const adc = await givenAdcData(wafapp);

    let response = await client
      .get(prefix + '/adcs')
      .query({filter: {where: {id: adc.id}}})
      .expect(200);

    expect(response.body.adcs).to.containDeep([toJSON(adc)]);
  });

  it('get ' + prefix + '/adcs/count', async () => {
    let response = await client.get(prefix + '/adcs/count').expect(200);
    expect(response.body.count).to.eql(0);

    const adc = await givenAdcData(wafapp);

    response = await client
      .get(prefix + '/adcs/count')
      .query({where: {id: adc.id}})
      .expect(200);
    expect(response.body.count).to.eql(1);
  });

  it('get ' + prefix + '/adcs/{id}: selected item', async () => {
    await givenAdcData(wafapp);
    const adc = await givenAdcData(wafapp);

    let response = await client.get(prefix + '/adcs/' + adc.id).expect(200);

    expect(response.body.adc).to.containDeep(toJSON(adc));
  });

  it('get ' + prefix + '/adcs/{id}: not found', async () => {
    await client.get(prefix + '/adcs/' + uuid()).expect(404);
  });

  it('patch ' + prefix + '/adcs/{id}: existing item', async () => {
    const patched_name = {name: 'new adc name'};
    const adc = await givenAdcData(wafapp);

    await client
      .patch(prefix + '/adcs/' + adc.id)
      .send(patched_name)
      .expect(204, '');
  });

  it('patch ' + prefix + '/adcs/{id}: non-existing item', async () => {
    const patched_name = {name: 'new adc name'};
    await client
      .patch(prefix + '/adcs/' + uuid())
      .send(patched_name)
      .expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: non-existing item', async () => {
    await client.del(prefix + '/adcs/' + uuid()).expect(404);
  });

  it('delete ' + prefix + '/adcs/{id}: existing item', async () => {
    const adc = await givenAdcData(wafapp);

    await client.del(prefix + '/adcs/' + adc.id).expect(204);
  });
});