/**
 * Auto-generated types for Copy of BG Software Tracking
 * Generated from QuickBase app: bvba8quak
 * Last updated: 2025-07-28T14:51:40.475Z
 */

/**
 * Background Software Management
 */
export interface CopyOfBGSoftwareTrackingApp {
  name: "BG_SOFTWARE";
  appId: "bvba8quak";
  displayName: "Copy of BG Software Tracking";
  description?: string;
  generatedAt: string;
  tables: {
    software?: SoftwareTable;
    employees?: EmployeesTable;
    conversations?: ConversationsTable;
    projects?: ProjectsTable;
    projectdeployments?: ProjectdeploymentsTable;
  };
}
export interface SoftwareTable {
  tableId: string;
  displayName: string;
  friendlyName: string;
  fields: {
    name?: {
      fieldId: 6;
      type: "text";
      displayName: "Name";
      friendlyName: "name";
      required: false;
    };
    type?: {
      fieldId: 7;
      type: "text";
      displayName: "Type";
      friendlyName: "type";
      required: false;
      /**
       * @minItems 2
       * @maxItems 2
       */
      choices: ["Cloud-Based", "Networked"];
    };
    status?: {
      fieldId: 15;
      type: "text";
      displayName: "Status";
      friendlyName: "status";
      required: false;
      /**
       * @minItems 5
       * @maxItems 5
       */
      choices: ["Enterprise", "Active", "Pilot", "Tracking", "Closed"];
    };
    primaryuse?: {
      fieldId: 10;
      type: "text";
      displayName: "Primary Use";
      friendlyName: "primaryuse";
      required: false;
    };
    bgownerfullname?: {
      fieldId: 16;
      type: "text";
      displayName: "BG Owner - Full Name";
      friendlyName: "bgownerfullname";
      required: false;
    };
    bgowneremail?: {
      fieldId: 17;
      type: "text";
      displayName: "BG Owner - Email";
      friendlyName: "bgowneremail";
      required: false;
    };
    bgownerdepartment?: {
      fieldId: 18;
      type: "text";
      displayName: "BG Owner - Department";
      friendlyName: "bgownerdepartment";
      required: false;
    };
    vendor?: {
      fieldId: 8;
      type: "text";
      displayName: "Vendor";
      friendlyName: "vendor";
      required: false;
    };
    vendorcontactname?: {
      fieldId: 11;
      type: "text";
      displayName: "Vendor Contact Name";
      friendlyName: "vendorcontactname";
      required: false;
    };
    vendorcontactemail?: {
      fieldId: 12;
      type: "text";
      displayName: "Vendor Contact Email";
      friendlyName: "vendorcontactemail";
      required: false;
    };
    website?: {
      fieldId: 14;
      type: "url";
      displayName: "Website";
      friendlyName: "website";
      required: false;
    };
    notes?: {
      fieldId: 13;
      type: "text";
      displayName: "Notes";
      friendlyName: "notes";
      required: false;
    };
    bgowner?: {
      fieldId: 9;
      type: "text";
      displayName: "BG Owner";
      friendlyName: "bgowner";
      required: false;
    };
    conversationrecords?: {
      fieldId: 19;
      type: "url";
      displayName: "Conversation records";
      friendlyName: "conversationrecords";
      required: false;
    };
    addconversation?: {
      fieldId: 20;
      type: "url";
      displayName: "Add Conversation";
      friendlyName: "addconversation";
      required: false;
    };
    deploymentrecords?: {
      fieldId: 21;
      type: "url";
      displayName: "Deployment records";
      friendlyName: "deploymentrecords";
      required: false;
    };
    adddeployment?: {
      fieldId: 22;
      type: "url";
      displayName: "Add Deployment";
      friendlyName: "adddeployment";
      required: false;
    };
  };
}
export interface EmployeesTable {
  tableId: string;
  displayName: string;
  friendlyName: string;
  fields: {
    entraid?: {
      fieldId: 6;
      type: "text";
      displayName: "Entra ID";
      friendlyName: "entraid";
      required: true;
    };
    firstName?: {
      fieldId: 7;
      type: "text";
      displayName: "First Name";
      friendlyName: "firstName";
      required: false;
    };
    lastName?: {
      fieldId: 8;
      type: "text";
      displayName: "Last Name";
      friendlyName: "lastName";
      required: false;
    };
    fullname?: {
      fieldId: 9;
      type: "text";
      displayName: "Full Name";
      friendlyName: "fullname";
      required: false;
    };
    title?: {
      fieldId: 10;
      type: "text";
      displayName: "Title";
      friendlyName: "title";
      required: false;
    };
    department?: {
      fieldId: 11;
      type: "text";
      displayName: "Department";
      friendlyName: "department";
      required: false;
    };
    office?: {
      fieldId: 12;
      type: "text";
      displayName: "Office";
      friendlyName: "office";
      required: false;
    };
    email?: {
      fieldId: 13;
      type: "text";
      displayName: "Email";
      friendlyName: "email";
      required: false;
    };
    phone?: {
      fieldId: 14;
      type: "text";
      displayName: "Phone";
      friendlyName: "phone";
      required: false;
    };
    softwarerecords?: {
      fieldId: 15;
      type: "url";
      displayName: "Software records";
      friendlyName: "softwarerecords";
      required: false;
    };
    addsoftware?: {
      fieldId: 16;
      type: "url";
      displayName: "Add Software";
      friendlyName: "addsoftware";
      required: false;
    };
    deploymentrecords?: {
      fieldId: 17;
      type: "url";
      displayName: "Deployment records";
      friendlyName: "deploymentrecords";
      required: false;
    };
    adddeployment?: {
      fieldId: 18;
      type: "url";
      displayName: "Add Deployment";
      friendlyName: "adddeployment";
      required: false;
    };
  };
}
export interface ConversationsTable {
  tableId: string;
  displayName: string;
  friendlyName: string;
  fields: {
    softwarename?: {
      fieldId: 12;
      type: "text";
      displayName: "Software - Name";
      friendlyName: "softwarename";
      required: false;
    };
    decisionmade?: {
      fieldId: 11;
      type: "checkbox";
      displayName: "Decision Made";
      friendlyName: "decisionmade";
      required: false;
    };
    decision?: {
      fieldId: 9;
      type: "text";
      displayName: "Decision";
      friendlyName: "decision";
      required: false;
    };
    comments?: {
      fieldId: 10;
      type: "text";
      displayName: "Comments";
      friendlyName: "comments";
      required: false;
    };
  };
}
export interface ProjectsTable {
  tableId: string;
  displayName: string;
  friendlyName: string;
  fields: {
    projectName?: {
      fieldId: 8;
      type: "text";
      displayName: "Project Name";
      friendlyName: "projectName";
      required: false;
    };
    regionname?: {
      fieldId: 9;
      type: "text";
      displayName: "Region - Name";
      friendlyName: "regionname";
      required: false;
    };
    divisionname?: {
      fieldId: 10;
      type: "text";
      displayName: "Division - Name";
      friendlyName: "divisionname";
      required: false;
    };
    marketsectorname?: {
      fieldId: 11;
      type: "text";
      displayName: "Market Sector - Name";
      friendlyName: "marketsectorname";
      required: false;
    };
    address?: {
      fieldId: 15;
      type: "text";
      displayName: "Address";
      friendlyName: "address";
      required: false;
    };
    street1?: {
      fieldId: 16;
      type: "text";
      displayName: "Street 1";
      friendlyName: "street1";
      required: false;
    };
    street2?: {
      fieldId: 17;
      type: "text";
      displayName: "Street 2";
      friendlyName: "street2";
      required: false;
    };
    city?: {
      fieldId: 18;
      type: "text";
      displayName: "City";
      friendlyName: "city";
      required: false;
    };
    stateregion?: {
      fieldId: 19;
      type: "text";
      displayName: "State/Region";
      friendlyName: "stateregion";
      required: false;
    };
    postalcode?: {
      fieldId: 20;
      type: "text";
      displayName: "Postal Code";
      friendlyName: "postalcode";
      required: false;
    };
    country?: {
      fieldId: 21;
      type: "text";
      displayName: "Country";
      friendlyName: "country";
      required: false;
      /**
       * @minItems 254
       * @maxItems 254
       */
      choices: [
        "Afghanistan",
        "Aland Islands",
        "Albania",
        "Algeria",
        "American Samoa",
        "Andorra",
        "Angola",
        "Anguilla",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Aruba",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bermuda",
        "Bhutan",
        "Bolivia, Plurinational State of",
        "Bonaire, Sint Eustatius and Saba",
        "Bosnia and Herzegovina",
        "Botswana",
        "Bouvet Island",
        "Brazil",
        "British Indian Ocean Territory",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Cape Verde",
        "Cayman Islands",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Christmas Island",
        "Cocos (Keeling) Islands",
        "Colombia",
        "Comoros",
        "Congo",
        "Congo, The Democratic Republic of the",
        "Cook Islands",
        "Costa Rica",
        "Cote d'Ivoire",
        "Croatia",
        "Cuba",
        "Curacao",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Ethiopia",
        "Falkland Islands (Malvinas)",
        "Faroe Islands",
        "Fiji",
        "Finland",
        "France",
        "French Guiana",
        "French Polynesia",
        "French Southern Territories",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Gibraltar",
        "Greece",
        "Greenland",
        "Grenada",
        "Guadeloupe",
        "Guam",
        "Guatemala",
        "Guernsey",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Heard Island and McDonald Islands",
        "Holy See (Vatican City State)",
        "Honduras",
        "Hong Kong",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran, Islamic Republic of",
        "Iraq",
        "Ireland",
        "Isle of Man",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jersey",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Korea, Democratic People's Republic of",
        "Korea, Republic of",
        "Kosovo",
        "Kuwait",
        "Kyrgyzstan",
        "Lao People's Democratic Republic",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Macao",
        "Macedonia, The Former Yugoslav Republic of",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Martinique",
        "Mauritania",
        "Mauritius",
        "Mayotte",
        "Mexico",
        "Micronesia, Federated States of",
        "Moldova, Republic of",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Montserrat",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Caledonia",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Niue",
        "Norfolk Island",
        "Northern Cyprus",
        "Northern Mariana Islands",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine, State of",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Pitcairn Islands",
        "Poland",
        "Portugal",
        "Puerto Rico",
        "Qatar",
        "Reunion",
        "Romania",
        "Russian Federation",
        "Rwanda",
        "Western Sahara",
        "Saint Barthelemy",
        "Saint Helena, Ascension and Tristan da Cunha",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Martin (French Part)",
        "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Sint Maarten (Dutch Part)",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "Somaliland",
        "South Africa",
        "South Georgia and the South Sandwich Islands",
        "South Ossetia",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Svalbard and Jan Mayen",
        "Swaziland",
        "Sweden",
        "Switzerland",
        "Syrian Arab Republic",
        "Taiwan, Province of China",
        "Tajikistan",
        "Tanzania, United Republic of",
        "Thailand",
        "Timor-Leste",
        "Togo",
        "Tokelau",
        "Tonga",
        "Transnistria",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Turks and Caicos Islands",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States",
        "United States Minor Outlying Islands",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Venezuela, Bolivarian Republic of",
        "Vietnam",
        "Virgin Islands, British",
        "Virgin Islands, US",
        "Wallis and Futuna",
        "Yemen",
        "Zambia",
        "Zimbabwe"
      ];
    };
    deploymentrecords?: {
      fieldId: 22;
      type: "url";
      displayName: "Deployment records";
      friendlyName: "deploymentrecords";
      required: false;
    };
    adddeployment?: {
      fieldId: 23;
      type: "url";
      displayName: "Add Deployment";
      friendlyName: "adddeployment";
      required: false;
    };
  };
}
export interface ProjectdeploymentsTable {
  tableId: string;
  displayName: string;
  friendlyName: string;
  fields: {
    projectName?: {
      fieldId: 14;
      type: "text";
      displayName: "Project Name";
      friendlyName: "projectName";
      required: false;
    };
    softwarename?: {
      fieldId: 15;
      type: "text";
      displayName: "Software - Name";
      friendlyName: "softwarename";
      required: false;
    };
    bgprojectcontactfullname?: {
      fieldId: 16;
      type: "text";
      displayName: "BG Project Contact - Full Name";
      friendlyName: "bgprojectcontactfullname";
      required: false;
    };
    bgprojectcontactemail?: {
      fieldId: 17;
      type: "text";
      displayName: "BG Project Contact - Email";
      friendlyName: "bgprojectcontactemail";
      required: false;
    };
    comments?: {
      fieldId: 12;
      type: "text";
      displayName: "Comments";
      friendlyName: "comments";
      required: false;
    };
    bgprojectcontact?: {
      fieldId: 10;
      type: "text";
      displayName: "BG Project Contact";
      friendlyName: "bgprojectcontact";
      required: false;
    };
  };
}


// Table: Software (bvba8quar)

/**
 * QuickBase table: Software (bvba8quar)
 */
export interface Software {
  tableId: "bvba8quar";
  displayName: "Software";
  friendlyName: "software";
  fields: {
    name?: {
      fieldId: 6;
      type: "text";
      displayName: "Name";
      friendlyName: "name";
      required: false;
    };
    type?: {
      fieldId: 7;
      type: "text";
      displayName: "Type";
      friendlyName: "type";
      required: false;
      /**
       * @minItems 2
       * @maxItems 2
       */
      choices: ["Cloud-Based", "Networked"];
    };
    status?: {
      fieldId: 15;
      type: "text";
      displayName: "Status";
      friendlyName: "status";
      required: false;
      /**
       * @minItems 5
       * @maxItems 5
       */
      choices: ["Enterprise", "Active", "Pilot", "Tracking", "Closed"];
    };
    primaryuse?: {
      fieldId: 10;
      type: "text";
      displayName: "Primary Use";
      friendlyName: "primaryuse";
      required: false;
    };
    bgownerfullname?: {
      fieldId: 16;
      type: "text";
      displayName: "BG Owner - Full Name";
      friendlyName: "bgownerfullname";
      required: false;
    };
    bgowneremail?: {
      fieldId: 17;
      type: "text";
      displayName: "BG Owner - Email";
      friendlyName: "bgowneremail";
      required: false;
    };
    bgownerdepartment?: {
      fieldId: 18;
      type: "text";
      displayName: "BG Owner - Department";
      friendlyName: "bgownerdepartment";
      required: false;
    };
    vendor?: {
      fieldId: 8;
      type: "text";
      displayName: "Vendor";
      friendlyName: "vendor";
      required: false;
    };
    vendorcontactname?: {
      fieldId: 11;
      type: "text";
      displayName: "Vendor Contact Name";
      friendlyName: "vendorcontactname";
      required: false;
    };
    vendorcontactemail?: {
      fieldId: 12;
      type: "text";
      displayName: "Vendor Contact Email";
      friendlyName: "vendorcontactemail";
      required: false;
    };
    website?: {
      fieldId: 14;
      type: "url";
      displayName: "Website";
      friendlyName: "website";
      required: false;
    };
    notes?: {
      fieldId: 13;
      type: "text";
      displayName: "Notes";
      friendlyName: "notes";
      required: false;
    };
    bgowner?: {
      fieldId: 9;
      type: "text";
      displayName: "BG Owner";
      friendlyName: "bgowner";
      required: false;
    };
    conversationrecords?: {
      fieldId: 19;
      type: "url";
      displayName: "Conversation records";
      friendlyName: "conversationrecords";
      required: false;
    };
    addconversation?: {
      fieldId: 20;
      type: "url";
      displayName: "Add Conversation";
      friendlyName: "addconversation";
      required: false;
    };
    deploymentrecords?: {
      fieldId: 21;
      type: "url";
      displayName: "Deployment records";
      friendlyName: "deploymentrecords";
      required: false;
    };
    adddeployment?: {
      fieldId: 22;
      type: "url";
      displayName: "Add Deployment";
      friendlyName: "adddeployment";
      required: false;
    };
  };
}


// Table: Employees (bvba8quas)

/**
 * QuickBase table: Employees (bvba8quas)
 */
export interface Employees {
  tableId: "bvba8quas";
  displayName: "Employees";
  friendlyName: "employees";
  fields: {
    entraid?: {
      fieldId: 6;
      type: "text";
      displayName: "Entra ID";
      friendlyName: "entraid";
      required: true;
    };
    firstName?: {
      fieldId: 7;
      type: "text";
      displayName: "First Name";
      friendlyName: "firstName";
      required: false;
    };
    lastName?: {
      fieldId: 8;
      type: "text";
      displayName: "Last Name";
      friendlyName: "lastName";
      required: false;
    };
    fullname?: {
      fieldId: 9;
      type: "text";
      displayName: "Full Name";
      friendlyName: "fullname";
      required: false;
    };
    title?: {
      fieldId: 10;
      type: "text";
      displayName: "Title";
      friendlyName: "title";
      required: false;
    };
    department?: {
      fieldId: 11;
      type: "text";
      displayName: "Department";
      friendlyName: "department";
      required: false;
    };
    office?: {
      fieldId: 12;
      type: "text";
      displayName: "Office";
      friendlyName: "office";
      required: false;
    };
    email?: {
      fieldId: 13;
      type: "text";
      displayName: "Email";
      friendlyName: "email";
      required: false;
    };
    phone?: {
      fieldId: 14;
      type: "text";
      displayName: "Phone";
      friendlyName: "phone";
      required: false;
    };
    softwarerecords?: {
      fieldId: 15;
      type: "url";
      displayName: "Software records";
      friendlyName: "softwarerecords";
      required: false;
    };
    addsoftware?: {
      fieldId: 16;
      type: "url";
      displayName: "Add Software";
      friendlyName: "addsoftware";
      required: false;
    };
    deploymentrecords?: {
      fieldId: 17;
      type: "url";
      displayName: "Deployment records";
      friendlyName: "deploymentrecords";
      required: false;
    };
    adddeployment?: {
      fieldId: 18;
      type: "url";
      displayName: "Add Deployment";
      friendlyName: "adddeployment";
      required: false;
    };
  };
}


// Table: Conversations (bvba8qubc)

/**
 * QuickBase table: Conversations (bvba8qubc)
 */
export interface Conversations {
  tableId: "bvba8qubc";
  displayName: "Conversations";
  friendlyName: "conversations";
  fields: {
    softwarename?: {
      fieldId: 12;
      type: "text";
      displayName: "Software - Name";
      friendlyName: "softwarename";
      required: false;
    };
    decisionmade?: {
      fieldId: 11;
      type: "checkbox";
      displayName: "Decision Made";
      friendlyName: "decisionmade";
      required: false;
    };
    decision?: {
      fieldId: 9;
      type: "text";
      displayName: "Decision";
      friendlyName: "decision";
      required: false;
    };
    comments?: {
      fieldId: 10;
      type: "text";
      displayName: "Comments";
      friendlyName: "comments";
      required: false;
    };
  };
}


// Table: Projects (bvba8qube)

/**
 * QuickBase table: Projects (bvba8qube)
 */
export interface Projects {
  tableId: "bvba8qube";
  displayName: "Projects";
  friendlyName: "projects";
  fields: {
    projectName?: {
      fieldId: 8;
      type: "text";
      displayName: "Project Name";
      friendlyName: "projectName";
      required: false;
    };
    regionname?: {
      fieldId: 9;
      type: "text";
      displayName: "Region - Name";
      friendlyName: "regionname";
      required: false;
    };
    divisionname?: {
      fieldId: 10;
      type: "text";
      displayName: "Division - Name";
      friendlyName: "divisionname";
      required: false;
    };
    marketsectorname?: {
      fieldId: 11;
      type: "text";
      displayName: "Market Sector - Name";
      friendlyName: "marketsectorname";
      required: false;
    };
    address?: {
      fieldId: 15;
      type: "text";
      displayName: "Address";
      friendlyName: "address";
      required: false;
    };
    street1?: {
      fieldId: 16;
      type: "text";
      displayName: "Street 1";
      friendlyName: "street1";
      required: false;
    };
    street2?: {
      fieldId: 17;
      type: "text";
      displayName: "Street 2";
      friendlyName: "street2";
      required: false;
    };
    city?: {
      fieldId: 18;
      type: "text";
      displayName: "City";
      friendlyName: "city";
      required: false;
    };
    stateregion?: {
      fieldId: 19;
      type: "text";
      displayName: "State/Region";
      friendlyName: "stateregion";
      required: false;
    };
    postalcode?: {
      fieldId: 20;
      type: "text";
      displayName: "Postal Code";
      friendlyName: "postalcode";
      required: false;
    };
    country?: {
      fieldId: 21;
      type: "text";
      displayName: "Country";
      friendlyName: "country";
      required: false;
      /**
       * @minItems 254
       * @maxItems 254
       */
      choices: [
        "Afghanistan",
        "Aland Islands",
        "Albania",
        "Algeria",
        "American Samoa",
        "Andorra",
        "Angola",
        "Anguilla",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Aruba",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bermuda",
        "Bhutan",
        "Bolivia, Plurinational State of",
        "Bonaire, Sint Eustatius and Saba",
        "Bosnia and Herzegovina",
        "Botswana",
        "Bouvet Island",
        "Brazil",
        "British Indian Ocean Territory",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Cape Verde",
        "Cayman Islands",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Christmas Island",
        "Cocos (Keeling) Islands",
        "Colombia",
        "Comoros",
        "Congo",
        "Congo, The Democratic Republic of the",
        "Cook Islands",
        "Costa Rica",
        "Cote d'Ivoire",
        "Croatia",
        "Cuba",
        "Curacao",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Ethiopia",
        "Falkland Islands (Malvinas)",
        "Faroe Islands",
        "Fiji",
        "Finland",
        "France",
        "French Guiana",
        "French Polynesia",
        "French Southern Territories",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Gibraltar",
        "Greece",
        "Greenland",
        "Grenada",
        "Guadeloupe",
        "Guam",
        "Guatemala",
        "Guernsey",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Heard Island and McDonald Islands",
        "Holy See (Vatican City State)",
        "Honduras",
        "Hong Kong",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran, Islamic Republic of",
        "Iraq",
        "Ireland",
        "Isle of Man",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jersey",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Korea, Democratic People's Republic of",
        "Korea, Republic of",
        "Kosovo",
        "Kuwait",
        "Kyrgyzstan",
        "Lao People's Democratic Republic",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Macao",
        "Macedonia, The Former Yugoslav Republic of",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Martinique",
        "Mauritania",
        "Mauritius",
        "Mayotte",
        "Mexico",
        "Micronesia, Federated States of",
        "Moldova, Republic of",
        "Monaco",
        "Mongolia",
        "Montenegro",
        "Montserrat",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Caledonia",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Niue",
        "Norfolk Island",
        "Northern Cyprus",
        "Northern Mariana Islands",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine, State of",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Pitcairn Islands",
        "Poland",
        "Portugal",
        "Puerto Rico",
        "Qatar",
        "Reunion",
        "Romania",
        "Russian Federation",
        "Rwanda",
        "Western Sahara",
        "Saint Barthelemy",
        "Saint Helena, Ascension and Tristan da Cunha",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Martin (French Part)",
        "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Serbia",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Sint Maarten (Dutch Part)",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "Somaliland",
        "South Africa",
        "South Georgia and the South Sandwich Islands",
        "South Ossetia",
        "South Sudan",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Svalbard and Jan Mayen",
        "Swaziland",
        "Sweden",
        "Switzerland",
        "Syrian Arab Republic",
        "Taiwan, Province of China",
        "Tajikistan",
        "Tanzania, United Republic of",
        "Thailand",
        "Timor-Leste",
        "Togo",
        "Tokelau",
        "Tonga",
        "Transnistria",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Turks and Caicos Islands",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States",
        "United States Minor Outlying Islands",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Venezuela, Bolivarian Republic of",
        "Vietnam",
        "Virgin Islands, British",
        "Virgin Islands, US",
        "Wallis and Futuna",
        "Yemen",
        "Zambia",
        "Zimbabwe"
      ];
    };
    deploymentrecords?: {
      fieldId: 22;
      type: "url";
      displayName: "Deployment records";
      friendlyName: "deploymentrecords";
      required: false;
    };
    adddeployment?: {
      fieldId: 23;
      type: "url";
      displayName: "Add Deployment";
      friendlyName: "adddeployment";
      required: false;
    };
  };
}


// Table: Project Deployments (bvba8quc2)

/**
 * QuickBase table: Project Deployments (bvba8quc2)
 */
export interface ProjectDeployments {
  tableId: "bvba8quc2";
  displayName: "Project Deployments";
  friendlyName: "projectdeployments";
  fields: {
    projectName?: {
      fieldId: 14;
      type: "text";
      displayName: "Project Name";
      friendlyName: "projectName";
      required: false;
    };
    softwarename?: {
      fieldId: 15;
      type: "text";
      displayName: "Software - Name";
      friendlyName: "softwarename";
      required: false;
    };
    bgprojectcontactfullname?: {
      fieldId: 16;
      type: "text";
      displayName: "BG Project Contact - Full Name";
      friendlyName: "bgprojectcontactfullname";
      required: false;
    };
    bgprojectcontactemail?: {
      fieldId: 17;
      type: "text";
      displayName: "BG Project Contact - Email";
      friendlyName: "bgprojectcontactemail";
      required: false;
    };
    comments?: {
      fieldId: 12;
      type: "text";
      displayName: "Comments";
      friendlyName: "comments";
      required: false;
    };
    bgprojectcontact?: {
      fieldId: 10;
      type: "text";
      displayName: "BG Project Contact";
      friendlyName: "bgprojectcontact";
      required: false;
    };
  };
}
