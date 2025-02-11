module.exports = {
  name: 'Google BigQuery',
  acronym: 'BIG',
  description: 'Search Google BigQuery resources using Google SQL.',
  defaultColor: 'light-gray',
  logging: {
    level: 'info'
  },
  entityTypes: ['IPv4', 'IPv4CIDR', 'IPv6', 'domain', 'url', 'MD5', 'SHA1', 'SHA256', 'email', 'cve'],
  styles: ['./styles/styles.less'],
  block: {
    component: {
      file: './component/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  options: [
    {
      key: 'serviceAccount',
      name: 'Google IAM Service Account Private Key',
      description:
        'A Google IAM Service Account Private Key in JSON format. Provide the full content of the Service Account Private Key in JSON format (including newlines). This option should be set to "Lock and hide option for all users".',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'query',
      name: 'Search Query',
      description:
        "The search query to execute written in GoogleSQL.  The query should use the named parameter `@entity` which will be replaced by the entity recognized on the user's screen.",
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'summaryFields',
      name: 'Summary Fields',
      description:
        'Comma delimited list of field names to include as part of the summary tags. JSON dot notation can be used to target nested fields. Fields must be returned by your search query to be displayed. You can change the label for your fields by prepending the label to the field path and separating it with a colon (i.e., "<label>:<json path>"). If left blank, a result count will be shown. This option should be set to "Lock and hide option for all users".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'maxSummaryTags',
      name: 'Maximum Number of Summary Tags',
      description:
        'The maximum number of summary tags to display in the Overlay Window before showing a count.  If set to 0, all tags will be shown.',
      default: 5,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'detailFields',
      name: 'Details Fields',
      description:
        'Comma delimited list of field names to include as part of the details block. JSON dot notation can be used to target nested fields. Fields must be returned by your search query to be displayed. You can change the label for your fields by prepending the label to the field path and separating it with a colon (i.e., "<label>:<json path>"). If left blank, all fields will be shown in tabular format. This option should be set to "Lock and hide option for all users".',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'documentTitleField',
      name: 'Document Title Field',
      description:
        'Field to use as the title for each returned document in the details template. This field must be returned by your search query.  Defaults to displaying a Row Number for the returned result.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'searchPrivateIps',
      name: 'Search Private IPs',
      description: 'If checked, the integration will search private IPs.  Defaults to `true`',
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
