// Shared country reference data, used by the Visa Assistant.
// The 6 destinations in FULL_DATA have real researched content; every other
// country gets honest general guidance rather than fabricated specifics.
// Mirrors the static mockup (urpassport-ng-visa-assistant.html) so behavior
// stays consistent between the two.

export const COUNTRIES: string[] = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
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
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (DRC)",
  "Congo (Republic of)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
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
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
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
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

export interface EligibilityQuestion {
  question: string;
  description: string;
}
export interface DocumentItem {
  label: string;
  description: string;
}
export interface CountryVisaData {
  code: string;
  fee: string;
  processing: string;
  wait: string;
  centre: string;
  eligibility: [string, string][];
  documents: [string, string][];
  risks: string[];
}

export const FULL_DATA: Record<string, CountryVisaData> = {
  "United Kingdom": {
    "code": "UK",
    "fee": "\u00a3127",
    "processing": "15 days",
    "wait": "3\u20135 weeks",
    "centre": "Lagos / Abuja (VFS Global)",
    "eligibility": [
      [
        "Are you visiting for tourism, business, family, or a short course only?",
        "Genuine visitor intent \u2014 no work, no settling, no public funds."
      ],
      [
        "Can you show enough funds to cover the whole trip without working?",
        "Bank statements or payslips that clearly support your stated budget."
      ],
      [
        "Do you have strong reasons to return to Nigeria \u2014 job, family, property?",
        "Employment with approved leave, property, or dependants are the strongest evidence."
      ],
      [
        "Is every detail on your form consistent with your supporting documents?",
        "Same employer name, same dates, same figures \u2014 everywhere."
      ]
    ],
    "documents": [
      [
        "Nigerian passport, 6+ months validity",
        "2 blank pages minimum."
      ],
      [
        "Completed online application form",
        "Submitted via the UK visa portal."
      ],
      [
        "Bank statements / payslips",
        "Shows sufficient funds for the trip."
      ],
      [
        "Detailed itinerary",
        "Accommodation and planned activities/dates."
      ],
      [
        "Proof of ties to Nigeria",
        "Employment letter with approved leave, property docs, or business registration."
      ],
      [
        "Invitation letter (if applicable)",
        "Plus sponsor's proof of UK status, address, and finances."
      ]
    ],
    "risks": [
      "Any mismatch between form and documents \u2014 employer name, dates, travel history.",
      "Weak or unclear ties to Nigeria \u2014 young, single, unemployed applicants face more scrutiny.",
      "Thin or unexplained bank activity in the statement period.",
      "Visa is valid 6 months from issue \u2014 must be used within that window."
    ]
  },
  "United States": {
    "code": "US",
    "fee": "$185",
    "processing": "Interview-based",
    "wait": "7\u201313 months for a slot",
    "centre": "Lagos / Abuja (USTravelDocs)",
    "eligibility": [
      [
        "Does every DS-160 answer match your supporting documents exactly?",
        "Employer name, income figures, and travel dates must line up everywhere."
      ],
      [
        "Can you clearly show funds for the trip?",
        "Bank statements or sponsor's financial evidence."
      ],
      [
        "Do you have strong ties to Nigeria \u2014 job, family, property?",
        "The core question behind most refusals under Section 214(b)."
      ],
      [
        "Have you ever been refused a US visa before?",
        "Not disqualifying, but be ready to explain what changed."
      ]
    ],
    "documents": [
      [
        "Nigerian passport, 6+ months beyond intended stay",
        ""
      ],
      [
        "DS-160 confirmation page",
        "Barcode must match your interview appointment."
      ],
      [
        "MRV fee receipt ($185)",
        "Paid via First Bank of Nigeria."
      ],
      [
        "US-spec passport photo",
        ""
      ],
      [
        "Any previous US visas (copies)",
        ""
      ],
      [
        "Supporting financial evidence",
        "Bank statements, employer letter, or sponsor documents."
      ]
    ],
    "risks": [
      "Interview backlog can run 7\u201313 months \u2014 start the process long before any firm travel date.",
      "Any inconsistency between DS-160 and supporting documents is a top refusal driver.",
      "Section 214(b) refusal (failure to show strong home ties) is the most common outcome for first-time applicants.",
      "Approval rate for Nigerian B1/B2 applicants runs roughly 45% \u2014 go in with realistic expectations."
    ]
  },
  "Canada": {
    "code": "CA",
    "fee": "CAD $100 + $85 biometrics",
    "processing": "6\u201314 weeks after biometrics",
    "wait": "8\u201316 weeks total",
    "centre": "Lagos / Abuja (VFS Global)",
    "eligibility": [
      [
        "Can you show funds well beyond the bare minimum?",
        "Nigerian applicants face closer financial scrutiny \u2014 a fuller picture (property, business, investments) helps."
      ],
      [
        "Do you have strong, documented ties to Nigeria?",
        "Property, tenancy, family or employment obligations."
      ],
      [
        "Have you booked your biometrics appointment promptly?",
        "Slots fill fast \u2014 book immediately after paying."
      ],
      [
        "Have you avoided booking non-refundable flights before approval?",
        "IRCC processing can run long; never commit financially before a decision."
      ]
    ],
    "documents": [
      [
        "Valid passport",
        ""
      ],
      [
        "IMM 5257 application form",
        "Via the IRCC online portal."
      ],
      [
        "Passport photos",
        ""
      ],
      [
        "Proof of funds for the trip",
        ""
      ],
      [
        "Proof of ties to Nigeria",
        "Property, tenancy agreement, family/employment obligations."
      ],
      [
        "Biometrics (fingerprints + photo)",
        "Mandatory, done in person, valid 10 years."
      ]
    ],
    "risks": [
      "Nigerian applicants face elevated financial-proof scrutiny.",
      "Biometrics appointments fill quickly \u2014 delay in booking adds weeks.",
      "Total realistic timeline runs 8\u201316 weeks \u2014 apply at least 4 months ahead.",
      "A medical exam may be required depending on stay length."
    ]
  },
  "United Arab Emirates": {
    "code": "AE",
    "fee": "$125\u2013$800 (by duration/entry type)",
    "processing": "3\u201310 days after DVN",
    "wait": "~1\u20132 weeks total",
    "centre": "Document Verification Hub (online) + VFS",
    "eligibility": [
      [
        "Have you obtained your Document Verification Number (DVN)?",
        "Required for all Nigerian applicants before the visa itself can be submitted."
      ],
      [
        "Can you show a strong 6-month bank statement?",
        "A stronger balance (often cited around \u20a61,000,000+) improves approval odds."
      ],
      [
        "Do you have hotel and flight bookings ready?",
        "Both are required as part of the application."
      ],
      [
        "If employed, do you have an NOC from your employer?",
        "No Objection Certificate \u2014 required for employed applicants."
      ]
    ],
    "documents": [
      [
        "Nigerian passport, 6+ months validity",
        "Clear scan of biodata + relevant pages."
      ],
      [
        "Recent front-facing photo",
        ""
      ],
      [
        "Document Verification Number (DVN)",
        "From documentverificationhub.ae \u2014 apply first, before anything else."
      ],
      [
        "6-month bank statement",
        ""
      ],
      [
        "Hotel booking confirmation",
        ""
      ],
      [
        "Flight itinerary",
        ""
      ]
    ],
    "risks": [
      "No visa-on-arrival for Nigerians \u2014 even with a valid US/UK/Schengen/Canada visa.",
      "Any mismatch between entered travel details and your passport is a top rejection trigger.",
      "Declare cash or instruments above AED 60,000 at customs.",
      "The DVN step must be completed first \u2014 nothing else can be submitted before it clears."
    ]
  },
  "France": {
    "code": "FR",
    "fee": "\u20ac90 + ~\u20ac38 VFS service fee",
    "processing": "15 days official",
    "wait": "Up to 45 days in peak season",
    "centre": "Lagos / Abuja (VFS Global / TLScontact)",
    "eligibility": [
      [
        "Do you have Schengen travel insurance (\u20ac30,000+ coverage)?",
        "Mandatory, valid across the whole Schengen zone."
      ],
      [
        "Can your bank statements support roughly \u20ac50\u2013100/day of your trip?",
        "A commonly cited benchmark for what funds should show."
      ],
      [
        "Do you have a confirmed round-trip flight reservation?",
        "A verifiable hold is accepted \u2014 you don't need to pay for the ticket yet."
      ],
      [
        "Do you have proof of accommodation for the whole stay?",
        "Hotel booking or a host's invitation letter."
      ]
    ],
    "documents": [
      [
        "Nigerian passport, 6+ months validity, issued within 10 years",
        "2+ blank pages."
      ],
      [
        "2 recent colour photos, 35\u00d745mm",
        ""
      ],
      [
        "Completed Schengen application form",
        "Via france-visas.gouv.fr."
      ],
      [
        "Bank statements \u2014 last 3 months",
        ""
      ],
      [
        "Schengen travel insurance",
        "Minimum \u20ac30,000 coverage."
      ],
      [
        "Confirmed round-trip flight reservation",
        ""
      ]
    ],
    "risks": [
      "Nigerian Schengen applications face closer scrutiny and a meaningfully higher rejection rate.",
      "Never book non-refundable flights or make non-refundable payments before the visa is issued.",
      "Book your VFS appointment 4\u20138 weeks ahead \u2014 slots fill fast in peak season.",
      "\"Schengen\" isn't one process \u2014 apply through whichever member country is your main destination."
    ]
  },
  "Ghana": {
    "code": "GH",
    "fee": "Visa-free (ECOWAS)",
    "processing": "N/A",
    "wait": "N/A",
    "centre": "N/A \u2014 no application needed",
    "eligibility": [
      [
        "Do you have a valid Nigerian passport or ECOWAS Travel Certificate?",
        "This is the only real requirement for entry."
      ],
      [
        "Is your yellow fever vaccination card up to date?",
        "The one hard entry requirement for Ghana."
      ],
      [
        "Do you have return or onward travel proof?",
        "Standard airline requirement, not immigration-specific."
      ],
      [
        "Are you transiting through a third country?",
        "A separate transit visa may still apply \u2014 check that leg separately."
      ]
    ],
    "documents": [
      [
        "Valid Nigerian passport (or ECOWAS Travel Certificate)",
        ""
      ],
      [
        "Yellow fever vaccination card",
        "The one hard entry requirement."
      ],
      [
        "Return / onward travel proof",
        ""
      ]
    ],
    "risks": [
      "No visa application needed \u2014 Nigerians travel visa-free under ECOWAS for stays up to 90 days.",
      "Airlines enforce their own passport-validity minimums even where immigration doesn't.",
      "Flights and applications surge Oct\u2013Dec (Detty December) \u2014 book that window early."
    ]
  }
};

// Maps a country name to the `destination` code used in the `application_types`
// table (only the 4 that are actually seeded in Supabase support a real,
// persisted application, the rest are informational only).
export const DB_BACKED_DESTINATIONS: Record<string, string> = {
  "United Kingdom": "UK",
  "United States": "US",
  "Canada": "Canada",
  "United Arab Emirates": "UAE",
};

export const GENERIC_ELIGIBILITY: [string, string][] = [
  ["Do you hold a passport valid 6+ months beyond your travel dates?", "Most countries require at least this much remaining validity."],
  ["Can you show sufficient funds for the trip?", "Bank statements, payslips, or sponsor documents."],
  ["Do you have documented ties to Nigeria?", "Employment, family, or property: evidence you intend to return."],
  ["Is every detail consistent across your application and documents?", "Name spelling, dates, and figures should match everywhere."]
];
export const GENERIC_DOCUMENTS: [string, string][] = [
  ["Valid passport (6+ months)", ""],
  ["Passport photographs", "Per the destination's own spec."],
  ["Completed application form", ""],
  ["Proof of funds", ""],
  ["Proof of accommodation / itinerary", ""]
];
export const GENERIC_RISKS: string[] = [
  "Document inconsistencies are the most common rejection reason worldwide.",
  "Confirm exact requirements on the destination's official embassy or consulate site. They vary by country and change often.",
  "Never pay a third party claiming to guarantee approval.",
];

// ISO 3166-1 alpha-2 codes for every country in COUNTRIES, used to call the
// live visa-requirements API (see src/lib/visaApi.ts).
export const COUNTRY_CODES: Record<string, string> = {
  "Afghanistan": "AF",
  "Albania": "AL",
  "Algeria": "DZ",
  "Andorra": "AD",
  "Angola": "AO",
  "Antigua and Barbuda": "AG",
  "Argentina": "AR",
  "Armenia": "AM",
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  "Bahamas": "BS",
  "Bahrain": "BH",
  "Bangladesh": "BD",
  "Barbados": "BB",
  "Belarus": "BY",
  "Belgium": "BE",
  "Belize": "BZ",
  "Benin": "BJ",
  "Bhutan": "BT",
  "Bolivia": "BO",
  "Bosnia and Herzegovina": "BA",
  "Botswana": "BW",
  "Brazil": "BR",
  "Brunei": "BN",
  "Bulgaria": "BG",
  "Burkina Faso": "BF",
  "Burundi": "BI",
  "Cabo Verde": "CV",
  "Cambodia": "KH",
  "Cameroon": "CM",
  "Canada": "CA",
  "Central African Republic": "CF",
  "Chad": "TD",
  "Chile": "CL",
  "China": "CN",
  "Colombia": "CO",
  "Comoros": "KM",
  "Congo (DRC)": "CD",
  "Congo (Republic of)": "CG",
  "Costa Rica": "CR",
  "Croatia": "HR",
  "Cuba": "CU",
  "Cyprus": "CY",
  "Czechia": "CZ",
  "Denmark": "DK",
  "Djibouti": "DJ",
  "Dominica": "DM",
  "Dominican Republic": "DO",
  "Ecuador": "EC",
  "Egypt": "EG",
  "El Salvador": "SV",
  "Equatorial Guinea": "GQ",
  "Eritrea": "ER",
  "Estonia": "EE",
  "Eswatini": "SZ",
  "Ethiopia": "ET",
  "Fiji": "FJ",
  "Finland": "FI",
  "France": "FR",
  "Gabon": "GA",
  "Gambia": "GM",
  "Georgia": "GE",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Grenada": "GD",
  "Guatemala": "GT",
  "Guinea": "GN",
  "Guinea-Bissau": "GW",
  "Guyana": "GY",
  "Haiti": "HT",
  "Honduras": "HN",
  "Hungary": "HU",
  "Iceland": "IS",
  "India": "IN",
  "Indonesia": "ID",
  "Iran": "IR",
  "Iraq": "IQ",
  "Ireland": "IE",
  "Israel": "IL",
  "Italy": "IT",
  "Jamaica": "JM",
  "Japan": "JP",
  "Jordan": "JO",
  "Kazakhstan": "KZ",
  "Kenya": "KE",
  "Kiribati": "KI",
  "Kuwait": "KW",
  "Kyrgyzstan": "KG",
  "Laos": "LA",
  "Latvia": "LV",
  "Lebanon": "LB",
  "Lesotho": "LS",
  "Liberia": "LR",
  "Libya": "LY",
  "Liechtenstein": "LI",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  "Madagascar": "MG",
  "Malawi": "MW",
  "Malaysia": "MY",
  "Maldives": "MV",
  "Mali": "ML",
  "Malta": "MT",
  "Marshall Islands": "MH",
  "Mauritania": "MR",
  "Mauritius": "MU",
  "Mexico": "MX",
  "Micronesia": "FM",
  "Moldova": "MD",
  "Monaco": "MC",
  "Mongolia": "MN",
  "Montenegro": "ME",
  "Morocco": "MA",
  "Mozambique": "MZ",
  "Myanmar": "MM",
  "Namibia": "NA",
  "Nauru": "NR",
  "Nepal": "NP",
  "Netherlands": "NL",
  "New Zealand": "NZ",
  "Nicaragua": "NI",
  "Niger": "NE",
  "North Korea": "KP",
  "North Macedonia": "MK",
  "Norway": "NO",
  "Oman": "OM",
  "Pakistan": "PK",
  "Palau": "PW",
  "Panama": "PA",
  "Papua New Guinea": "PG",
  "Paraguay": "PY",
  "Peru": "PE",
  "Philippines": "PH",
  "Poland": "PL",
  "Portugal": "PT",
  "Qatar": "QA",
  "Romania": "RO",
  "Russia": "RU",
  "Rwanda": "RW",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC",
  "Samoa": "WS",
  "San Marino": "SM",
  "Sao Tome and Principe": "ST",
  "Saudi Arabia": "SA",
  "Senegal": "SN",
  "Serbia": "RS",
  "Seychelles": "SC",
  "Sierra Leone": "SL",
  "Singapore": "SG",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Solomon Islands": "SB",
  "Somalia": "SO",
  "South Africa": "ZA",
  "South Korea": "KR",
  "South Sudan": "SS",
  "Spain": "ES",
  "Sri Lanka": "LK",
  "Sudan": "SD",
  "Suriname": "SR",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Syria": "SY",
  "Taiwan": "TW",
  "Tajikistan": "TJ",
  "Tanzania": "TZ",
  "Thailand": "TH",
  "Timor-Leste": "TL",
  "Togo": "TG",
  "Tonga": "TO",
  "Trinidad and Tobago": "TT",
  "Tunisia": "TN",
  "Turkmenistan": "TM",
  "Tuvalu": "TV",
  "Uganda": "UG",
  "Ukraine": "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  "Uruguay": "UY",
  "Uzbekistan": "UZ",
  "Vanuatu": "VU",
  "Vatican City": "VA",
  "Venezuela": "VE",
  "Vietnam": "VN",
  "Yemen": "YE",
  "Zambia": "ZM",
  "Zimbabwe": "ZW",
  "Turkey": "TR",
};
// Nigeria is the fixed "passport" side of every visa lookup in this app.
export const NIGERIA_CODE = "NG";
