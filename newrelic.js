'use strict';

exports.config = {
  app_name: ['StageDesigner-IAST-Testing'],
  license_key: '3ba517861e13642c57143393cc70336acfdeNRAL',
  security: {
    enabled: true,
    agent: {
      enabled: true
    }
  },
  logging: {
    level: 'info',
    filepath: './newrelic.log'
  }
};