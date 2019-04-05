import {Filter, repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  patch,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {Monitor} from '../models';
import {MonitorRepository} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';

const prefix = '/adcaas/v1';
const createDesc: string = 'Monitor resource that need to be created';
const updateDesc: string =
  'Monitor resource properties that need to be updated';

export class MonitorController {
  constructor(
    @repository(MonitorRepository)
    public monitorRepository: MonitorRepository,
  ) {}

  @post(prefix + '/monitors', {
    responses: {
      '200': Schema.response(Monitor, 'Successfully create Monitor resource'),
      '400': Schema.badRequest('Invalid Monitor resource'),
      '422': Schema.unprocessableEntity('Unprocessable Monitor resource'),
    },
  })
  async create(
    @requestBody(Schema.createRequest(Monitor, createDesc))
    reqBody: Partial<Monitor>,
  ): Promise<Response> {
    try {
      const data = await this.monitorRepository.create(reqBody);
      return new Response(Monitor, data);
    } catch (error) {
      throw new HttpErrors.BadRequest(error.message);
    }
  }

  @get(prefix + '/monitors', {
    responses: {
      '200': Schema.collectionResponse(
        Monitor,
        'Successfully retrieve Monitor resources',
      ),
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Monitor)) filter?: Filter,
  ): Promise<CollectionResponse> {
    const data = await this.monitorRepository.find(filter);
    return new CollectionResponse(Monitor, data);
  }

  @get(prefix + '/monitors/{monitorId}', {
    responses: {
      responses: {
        '200': Schema.response(Monitor, 'Successfully retrieve Pool resource'),
        '404': Schema.notFound('Can not find Pool resource'),
      },
    },
  })
  async findById(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
  ): Promise<Response> {
    const data = await this.monitorRepository.findById(id);
    return new Response(Monitor, data);
  }

  @patch(prefix + '/monitors/{monitorId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully update Monitor resource'),
      '404': Schema.notFound('Can not find Monitor resource'),
    },
  })
  async updateById(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
    @requestBody(Schema.createRequest(Monitor, updateDesc))
    monitor: Monitor,
  ): Promise<void> {
    await this.monitorRepository.updateById(id, monitor);
  }

  @del(prefix + '/monitors/{monitorId}', {
    responses: {
      '204': Schema.emptyResponse('Successfully delete Monitor resource'),
      '404': Schema.notFound('Can not find Monitor resource'),
    },
  })
  async deleteById(
    @param(Schema.pathParameter('monitorId', 'Monitor resource ID'))
    id: string,
  ): Promise<void> {
    await this.monitorRepository.deleteById(id);
  }
}
