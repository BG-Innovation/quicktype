// Auto-generated QuickBase client mappings and types
// Generated from discovered QuickBase schemas

import type { CopyOfBgSoftwareTrackingApp, SoftwareTable, EmployeesTable, ConversationsTable, ProjectsTable, ProjectdeploymentsTable } from './bg_software.types.js';

// App registry - maps app names to their generated types
export interface AppRegistry {
  bg_software: CopyOfBgSoftwareTrackingApp
}

// Table registry for each app
export interface AppTableRegistry {
  bg_software: {
    software: SoftwareTable
    employees: EmployeesTable
    conversations: ConversationsTable
    projects: ProjectsTable
    projectdeployments: ProjectdeploymentsTable
  }
}

// Extract app names from registry
export type AppName = keyof AppRegistry;

// Extract table names for a specific app
export type TableName<TApp extends AppName> = keyof AppTableRegistry[TApp];

// Get table type for specific app and table
export type AppTable<TApp extends AppName, TTable extends TableName<TApp>> = AppTableRegistry[TApp][TTable];

export type SoftwareData = {
  id?: number | string
  name?: string
  type?: 'Cloud-Based' | 'Networked'
  status?: 'Enterprise' | 'Active' | 'Pilot' | 'Tracking' | 'Closed'
  primaryuse?: string
  bgownerfullname?: string
  bgowneremail?: string
  bgownerdepartment?: string
  vendor?: string
  vendorcontactname?: string
  vendorcontactemail?: string
  website?: string
  notes?: string
  bgowner?: string
  conversationrecords?: string
  addconversation?: string
  deploymentrecords?: string
  adddeployment?: string
}

export type EmployeesData = {
  id?: number | string
  entraid?: string
  firstName?: string
  lastName?: string
  fullname?: string
  title?: string
  department?: string
  office?: string
  email?: string
  phone?: string
  softwarerecords?: string
  addsoftware?: string
  deploymentrecords?: string
  adddeployment?: string
}

export type ConversationsData = {
  id?: number | string
  softwarename?: string
  decisionmade?: boolean
  decision?: string
  comments?: string
}

export type ProjectsData = {
  id?: number | string
  projectName?: string
  regionname?: string
  divisionname?: string
  marketsectorname?: string
  address?: string
  street1?: string
  street2?: string
  city?: string
  stateregion?: string
  postalcode?: string
  country?: 'Afghanistan' | 'Aland Islands' | 'Albania' | 'Algeria' | 'American Samoa' | 'Andorra' | 'Angola' | 'Anguilla' | 'Antarctica' | 'Antigua and Barbuda' | 'Argentina' | 'Armenia' | 'Aruba' | 'Australia' | 'Austria' | 'Azerbaijan' | 'Bahamas' | 'Bahrain' | 'Bangladesh' | 'Barbados' | 'Belarus' | 'Belgium' | 'Belize' | 'Benin' | 'Bermuda' | 'Bhutan' | 'Bolivia, Plurinational State of' | 'Bonaire, Sint Eustatius and Saba' | 'Bosnia and Herzegovina' | 'Botswana' | 'Bouvet Island' | 'Brazil' | 'British Indian Ocean Territory' | 'Brunei Darussalam' | 'Bulgaria' | 'Burkina Faso' | 'Burundi' | 'Cambodia' | 'Cameroon' | 'Canada' | 'Cape Verde' | 'Cayman Islands' | 'Central African Republic' | 'Chad' | 'Chile' | 'China' | 'Christmas Island' | 'Cocos (Keeling) Islands' | 'Colombia' | 'Comoros' | 'Congo' | 'Congo, The Democratic Republic of the' | 'Cook Islands' | 'Costa Rica' | 'Cote d'Ivoire' | 'Croatia' | 'Cuba' | 'Curacao' | 'Cyprus' | 'Czech Republic' | 'Denmark' | 'Djibouti' | 'Dominica' | 'Dominican Republic' | 'Ecuador' | 'Egypt' | 'El Salvador' | 'Equatorial Guinea' | 'Eritrea' | 'Estonia' | 'Ethiopia' | 'Falkland Islands (Malvinas)' | 'Faroe Islands' | 'Fiji' | 'Finland' | 'France' | 'French Guiana' | 'French Polynesia' | 'French Southern Territories' | 'Gabon' | 'Gambia' | 'Georgia' | 'Germany' | 'Ghana' | 'Gibraltar' | 'Greece' | 'Greenland' | 'Grenada' | 'Guadeloupe' | 'Guam' | 'Guatemala' | 'Guernsey' | 'Guinea' | 'Guinea-Bissau' | 'Guyana' | 'Haiti' | 'Heard Island and McDonald Islands' | 'Holy See (Vatican City State)' | 'Honduras' | 'Hong Kong' | 'Hungary' | 'Iceland' | 'India' | 'Indonesia' | 'Iran, Islamic Republic of' | 'Iraq' | 'Ireland' | 'Isle of Man' | 'Israel' | 'Italy' | 'Jamaica' | 'Japan' | 'Jersey' | 'Jordan' | 'Kazakhstan' | 'Kenya' | 'Kiribati' | 'Korea, Democratic People's Republic of' | 'Korea, Republic of' | 'Kosovo' | 'Kuwait' | 'Kyrgyzstan' | 'Lao People's Democratic Republic' | 'Latvia' | 'Lebanon' | 'Lesotho' | 'Liberia' | 'Libya' | 'Liechtenstein' | 'Lithuania' | 'Luxembourg' | 'Macao' | 'Macedonia, The Former Yugoslav Republic of' | 'Madagascar' | 'Malawi' | 'Malaysia' | 'Maldives' | 'Mali' | 'Malta' | 'Marshall Islands' | 'Martinique' | 'Mauritania' | 'Mauritius' | 'Mayotte' | 'Mexico' | 'Micronesia, Federated States of' | 'Moldova, Republic of' | 'Monaco' | 'Mongolia' | 'Montenegro' | 'Montserrat' | 'Morocco' | 'Mozambique' | 'Myanmar' | 'Namibia' | 'Nauru' | 'Nepal' | 'Netherlands' | 'New Caledonia' | 'New Zealand' | 'Nicaragua' | 'Niger' | 'Nigeria' | 'Niue' | 'Norfolk Island' | 'Northern Cyprus' | 'Northern Mariana Islands' | 'Norway' | 'Oman' | 'Pakistan' | 'Palau' | 'Palestine, State of' | 'Panama' | 'Papua New Guinea' | 'Paraguay' | 'Peru' | 'Philippines' | 'Pitcairn Islands' | 'Poland' | 'Portugal' | 'Puerto Rico' | 'Qatar' | 'Reunion' | 'Romania' | 'Russian Federation' | 'Rwanda' | 'Western Sahara' | 'Saint Barthelemy' | 'Saint Helena, Ascension and Tristan da Cunha' | 'Saint Kitts and Nevis' | 'Saint Lucia' | 'Saint Martin (French Part)' | 'Saint Pierre and Miquelon' | 'Saint Vincent and the Grenadines' | 'Samoa' | 'San Marino' | 'Sao Tome and Principe' | 'Saudi Arabia' | 'Senegal' | 'Serbia' | 'Seychelles' | 'Sierra Leone' | 'Singapore' | 'Sint Maarten (Dutch Part)' | 'Slovakia' | 'Slovenia' | 'Solomon Islands' | 'Somalia' | 'Somaliland' | 'South Africa' | 'South Georgia and the South Sandwich Islands' | 'South Ossetia' | 'South Sudan' | 'Spain' | 'Sri Lanka' | 'Sudan' | 'Suriname' | 'Svalbard and Jan Mayen' | 'Swaziland' | 'Sweden' | 'Switzerland' | 'Syrian Arab Republic' | 'Taiwan, Province of China' | 'Tajikistan' | 'Tanzania, United Republic of' | 'Thailand' | 'Timor-Leste' | 'Togo' | 'Tokelau' | 'Tonga' | 'Transnistria' | 'Trinidad and Tobago' | 'Tunisia' | 'Turkey' | 'Turkmenistan' | 'Turks and Caicos Islands' | 'Tuvalu' | 'Uganda' | 'Ukraine' | 'United Arab Emirates' | 'United Kingdom' | 'United States' | 'United States Minor Outlying Islands' | 'Uruguay' | 'Uzbekistan' | 'Vanuatu' | 'Venezuela, Bolivarian Republic of' | 'Vietnam' | 'Virgin Islands, British' | 'Virgin Islands, US' | 'Wallis and Futuna' | 'Yemen' | 'Zambia' | 'Zimbabwe'
  deploymentrecords?: string
  adddeployment?: string
}

export type ProjectdeploymentsData = {
  id?: number | string
  projectName?: string
  softwarename?: string
  bgprojectcontactfullname?: string
  bgprojectcontactemail?: string
  comments?: string
  bgprojectcontact?: string
}


// Map table names to their data types
export type TableDataMap = {
  bg_software: {
    software: SoftwareData
    employees: EmployeesData
    conversations: ConversationsData
    projects: ProjectsData
    projectdeployments: ProjectdeploymentsData
  }
}


// Get data type for app/table combination
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = 
  TApp extends 'bg_software' ? TableDataMap['bg_software'][TTable] : Record<string, any>;

// Field ID mappings
const FieldMappings = {
  "bg_software": {
    "software": {
      "name": 6,
      "type": 7,
      "status": 15,
      "primaryuse": 10,
      "bgownerfullname": 16,
      "bgowneremail": 17,
      "bgownerdepartment": 18,
      "vendor": 8,
      "vendorcontactname": 11,
      "vendorcontactemail": 12,
      "website": 14,
      "notes": 13,
      "bgowner": 9,
      "conversationrecords": 19,
      "addconversation": 20,
      "deploymentrecords": 21,
      "adddeployment": 22
    },
    "employees": {
      "entraid": 6,
      "firstName": 7,
      "lastName": 8,
      "fullname": 9,
      "title": 10,
      "department": 11,
      "office": 12,
      "email": 13,
      "phone": 14,
      "softwarerecords": 15,
      "addsoftware": 16,
      "deploymentrecords": 17,
      "adddeployment": 18
    },
    "conversations": {
      "softwarename": 12,
      "decisionmade": 11,
      "decision": 9,
      "comments": 10
    },
    "projects": {
      "projectName": 8,
      "regionname": 9,
      "divisionname": 10,
      "marketsectorname": 11,
      "address": 15,
      "street1": 16,
      "street2": 17,
      "city": 18,
      "stateregion": 19,
      "postalcode": 20,
      "country": 21,
      "deploymentrecords": 22,
      "adddeployment": 23
    },
    "projectdeployments": {
      "projectName": 14,
      "softwarename": 15,
      "bgprojectcontactfullname": 16,
      "bgprojectcontactemail": 17,
      "comments": 12,
      "bgprojectcontact": 10
    }
  }
} as const;

// Table ID mappings  
const TableMappings = {
  "bg_software": {
    "software": "bvba8quar",
    "employees": "bvba8quas",
    "conversations": "bvba8qubc",
    "projects": "bvba8qube",
    "projectdeployments": "bvba8quc2"
  }
} as const;

// App configuration mapping
export const AppConfig = {
  "bg_software": {
    "appId": "bvba8quak",
    "name": "BG_SOFTWARE"
  }
} as const;

// Field name to ID mapping utility
export function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  const appMappings = FieldMappings[app as keyof typeof FieldMappings];
  if (appMappings) {
    const tableMappings = appMappings[table as keyof typeof appMappings];
    if (tableMappings && typeof tableMappings === 'object') {
      const fieldId = (tableMappings as Record<string, number>)[fieldName];
      if (typeof fieldId === 'number') {
        return fieldId;
      }
    }
  }
  
  // Fallback - try to parse as number or default to record ID field
  const fieldId = parseInt(fieldName);
  return isNaN(fieldId) ? 3 : fieldId;
}

// Table ID mapping
export function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable
): string {
  const appMappings = TableMappings[app as keyof typeof TableMappings];
  if (appMappings) {
    const tableId = appMappings[table as keyof typeof appMappings];
    if (typeof tableId === 'string') {
      return tableId;
    }
  }
  
  return String(table);
}

// Table ID mappings
export const TableMappings = {
  "bg_software": {
    "software": "bvba8quar",
    "employees": "bvba8quas",
    "conversations": "bvba8qubc",
    "projects": "bvba8qube",
    "projectdeployments": "bvba8quc2"
  }
} as const;

// Field ID mappings  
export const FieldMappings = {
  "bg_software": {
    "software": {
      "name": 6,
      "type": 7,
      "status": 15,
      "primaryuse": 10,
      "bgownerfullname": 16,
      "bgowneremail": 17,
      "bgownerdepartment": 18,
      "vendor": 8,
      "vendorcontactname": 11,
      "vendorcontactemail": 12,
      "website": 14,
      "notes": 13,
      "bgowner": 9,
      "conversationrecords": 19,
      "addconversation": 20,
      "deploymentrecords": 21,
      "adddeployment": 22
    },
    "employees": {
      "entraid": 6,
      "firstName": 7,
      "lastName": 8,
      "fullname": 9,
      "title": 10,
      "department": 11,
      "office": 12,
      "email": 13,
      "phone": 14,
      "softwarerecords": 15,
      "addsoftware": 16,
      "deploymentrecords": 17,
      "adddeployment": 18
    },
    "conversations": {
      "softwarename": 12,
      "decisionmade": 11,
      "decision": 9,
      "comments": 10
    },
    "projects": {
      "projectName": 8,
      "regionname": 9,
      "divisionname": 10,
      "marketsectorname": 11,
      "address": 15,
      "street1": 16,
      "street2": 17,
      "city": 18,
      "stateregion": 19,
      "postalcode": 20,
      "country": 21,
      "deploymentrecords": 22,
      "adddeployment": 23
    },
    "projectdeployments": {
      "projectName": 14,
      "softwarename": 15,
      "bgprojectcontactfullname": 16,
      "bgprojectcontactemail": 17,
      "comments": 12,
      "bgprojectcontact": 10
    }
  }
} as const;
