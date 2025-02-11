const { BigQuery } = require('@google-cloud/bigquery');
const async = require('async');
const _ = require('lodash');

let Logger;
let client;
let summaryFieldsCompiled = null;
let detailFieldsCompiled = null;
let previousSummaryFields = null;
let previousDetailFields = null;

let previousServiceAccount = null;
let serviceAccountCredentials = null;

function startup(logger) {
  Logger = logger;
}

function loadCredentials(options) {
  try {
    serviceAccountCredentials = JSON.parse(options.serviceAccount);
    previousServiceAccount = options.serviceAccount;
  } catch (parseError) {
    throw new Error('Invalid JSON provided for the "Google IAM Service Account Private Key" option');
  }

  return {
    client_email: serviceAccountCredentials.client_email,
    private_key: serviceAccountCredentials.private_key.replace(/\\n/g, '\n'),
    project_id: serviceAccountCredentials.project_id
  };
}

async function doLookup(entities, options, cb) {
  const lookupResults = [];
  Logger.trace({ entities, options }, 'doLookup');

  try {
    if (previousDetailFields === null || previousDetailFields !== options.detailFields) {
      detailFieldsCompiled = _compileFieldsOption(options.detailFields);
    }

    if (previousSummaryFields === null || previousSummaryFields !== options.summaryFields) {
      summaryFieldsCompiled = _compileFieldsOption(options.summaryFields, false);
    }
  } catch (compileError) {
    return cb({
      detail: compileError.message
    });
  }

  if (!client || previousServiceAccount !== options.serviceAccount) {
    try {
      client = new BigQuery({
        credentials: loadCredentials(options)
      });
    } catch (loadError) {
      return cb(loadError);
    }
  }

  try {
    await async.eachLimit(entities, 5, async (entity) => {
      if (entity.isIP && !options.searchPrivateIps && isPrivateIp(entity)) {
        return;
      }

      // Query must be written using GoogleSQL
      // https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax
      const [job] = await client.createQueryJob({
        // Configuration options documented here: https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#jobconfigurationquery
        query: options.query,
        location: 'US',
        maxResults: 100,
        parameterMode: 'NAMED',
        queryParameters: [
          {
            name: 'entity',
            parameterType: {
              type: 'STRING'
            },
            parameterValue: {
              value: entity.value
            }
          }
        ],
        // key, value pairs that are attached to the query
        labels: {
          source: 'polarity'
        }
      });

      Logger.trace(`Job ${job.id} started.`);
      const [rows] = await job.getQueryResults();
      Logger.trace({ rows }, `Job ${job.id} completed.`);

      if (Array.isArray(rows) && rows.length === 0) {
        lookupResults.push({
          entity,
          data: null
        });
      } else {
        lookupResults.push({
          entity,
          data: {
            summary: _getSummaryTags(rows, options),
            details: {
              rows: rows.map((row, index) => {
                return {
                  // Processed data for display
                  details: _getDetailBlockValues(row),
                  rowNumber: ++index,
                  title: _.get(row, options.documentTitleField, ''),
                  // Raw data returned from query
                  data: row
                };
              })
            }
          }
        });
      }
    });
  } catch (error) {
    if (error) {
      Logger.error({ error }, 'doLookup Error');
    }
    cb(error);
  }

  Logger.trace({ lookupResults }, 'doLookup results');

  cb(null, lookupResults);
}

function _getDetailBlockValues(row) {
  let values = [];

  detailFieldsCompiled.forEach((rule) => {
    let value = _.get(row, rule.path, null);
    if (value !== null) {
      values.push({
        label: rule.label,
        value
      });
    }
  });

  return values;
}

function _getSummaryTags(rows, options) {
  let tags = [];
  let uniqueValues = new Set();

  rows.forEach((row) => {
    summaryFieldsCompiled.forEach((rule) => {
      let value = _.get(row, rule.path, null);
      let alreadyExists = uniqueValues.has(normalizeSummaryTagValue(value));

      if (!alreadyExists) {
        if (value !== null) {
          if (rule.label.length > 0) {
            tags.push(`${rule.label}: ${value}`);
          } else {
            tags.push(value);
          }

          uniqueValues.add(normalizeSummaryTagValue(value));
        }
      }
    });
  });

  if (tags.length > options.maxSummaryTags && options.maxSummaryTags > 0) {
    let length = tags.length;
    tags = tags.slice(0, options.maxSummaryTags);
    tags.push(`+${length - options.maxSummaryTags} more`);
  }

  if (tags.length === 0) {
    tags.push(`${rows.length} result${rows.length > 1 ? 's' : ''}`);
  }

  return tags;
}

function normalizeSummaryTagValue(value) {
  if (value !== null && typeof value === 'string') {
    return value.toLowerCase().trim();
  }
  return value;
}

function CompileException(message) {
  this.message = message;
}

function _compileFieldsOption(fields, useDefaultLabels = true) {
  const compiledFields = [];

  fields.split(',').forEach((field) => {
    let tokens = field.split(':');
    let label;
    let fieldPath;

    if (tokens.length !== 1 && tokens.length !== 2) {
      throw new CompileException(
        `Invalid field "${field}".  Field should be of the format "<label>:<json path>" or "<json path>"`
      );
    }

    if (tokens.length === 1) {
      // no label
      fieldPath = tokens[0].trim();
      label = useDefaultLabels ? tokens[0].trim() : '';
    } else if (tokens.length === 2) {
      // label specified
      fieldPath = tokens[1].trim();
      label = tokens[0].trim();
    }

    compiledFields.push({
      label,
      path: fieldPath
    });
  });

  return compiledFields;
}

const isPrivateIp = (entity) => {
  return isLoopBackIp(entity.value) || isLinkLocalAddress(entity.value) || entity.isPrivateIP === true;
};

const isLoopBackIp = (entityValue) => {
  return entityValue.startsWith('127');
};

const isLinkLocalAddress = (entityValue) => {
  return entityValue.startsWith('169');
};

module.exports = {
  startup,
  doLookup
};
