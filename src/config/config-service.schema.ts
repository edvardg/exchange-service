import * as Joi from '@hapi/joi';

export const ServiceSchema = {
  port: Joi.required(),
  swagger: Joi.object().keys({
    description: Joi.string().required(),
    version: Joi.string().required(),
    path: Joi.string().required(),
  }),
  globalPrefix: Joi.string().required(),
  redis: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().required(),
  }),
  web3: Joi.object().keys({
    rpcUrl: Joi.string().required(),
    factoryV2Address: Joi.string().required(),
    pairV2InitCodeHash: Joi.string().required(),
  }),
  cache: Joi.object().keys({
    key: Joi.string().required(),
    ttl: Joi.number().required(),
  }),
} as any;
