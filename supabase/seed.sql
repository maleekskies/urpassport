-- Seeds application_types with the real content from the checklist docs.
-- Safe to re-run: it clears and re-inserts reference data only (no user data).

delete from application_types;

insert into application_types
  (category, destination, visa_subtype, display_name, fee_amount, fee_currency,
   processing_time_min_days, processing_time_max_days, document_requirements, process_steps, common_pitfalls, last_verified_date)
values
(
  'passport', null, null, 'Nigerian Passport Renewal',
  200000, 'NGN', 15, 42,
  '[
    {"key":"old_passport","label":"Current (old) passport","description":"Required for renewal, presented at biometrics for cancellation.","required":true},
    {"key":"nin_slip","label":"Valid NIN slip","description":"Must match your application name exactly.","required":true},
    {"key":"secondary_id","label":"Secondary ID","description":"National ID card, voter''s card, or driver''s licence.","required":true},
    {"key":"lga_letter","label":"Local Government identification letter","description":"Confirms your state and LGA of origin.","required":true},
    {"key":"photo","label":"Passport photo (ICAO spec)","description":"White background, 600x800px.","required":true},
    {"key":"guarantor_form","label":"Signed guarantor''s form","description":"Sworn before a Commissioner for Oaths.","required":true}
  ]',
  '[
    {"step_number":1,"title":"Create account","description":"Register at passport.immigration.gov.ng"},
    {"step_number":2,"title":"Enter NIN & personal details","description":"System auto-pulls NIMC data."},
    {"step_number":3,"title":"Choose passport type","description":"32 or 64 page."},
    {"step_number":4,"title":"Upload documents","description":"All required documents."},
    {"step_number":5,"title":"Pay on portal","description":"Official portal only, never a third party."},
    {"step_number":6,"title":"Book biometrics","description":"Print payment + acknowledgment slips."},
    {"step_number":7,"title":"Attend biometrics","description":"Bring original documents."},
    {"step_number":8,"title":"Track enrollment","description":"track.immigration.gov.ng"},
    {"step_number":9,"title":"Collect passport","description":"When status shows Issued."}
  ]',
  '["Name on application doesn''t exactly match NIN record.","Photo doesn''t meet spec.","Missed biometric slot without rescheduling.","Payment made outside the official portal."]',
  '2026-08-01'
),
(
  'visa', 'UK', 'tourist', 'UK Standard Visitor Visa',
  127, 'GBP', 10, 15,
  '[
    {"key":"passport","label":"Nigerian passport, 6+ months validity","description":"2 blank pages minimum.","required":true},
    {"key":"form","label":"Completed online application form","description":"Via the UK visa portal.","required":true},
    {"key":"funds","label":"Bank statements / payslips","description":"Shows sufficient funds.","required":true},
    {"key":"itinerary","label":"Detailed itinerary","description":"Accommodation and activities.","required":true},
    {"key":"ties","label":"Proof of ties to Nigeria","description":"Employment letter, property, or business registration.","required":true},
    {"key":"invitation","label":"Invitation letter (if applicable)","description":"Plus sponsor''s proof of status.","required":false}
  ]',
  '[
    {"step_number":1,"title":"Complete form","description":"Online at the UK visa portal."},
    {"step_number":2,"title":"Upload documents","description":"All required evidence."},
    {"step_number":3,"title":"Pay & book biometrics","description":"VFS Global appointment."},
    {"step_number":4,"title":"Attend VFS appointment","description":"Lagos or Abuja."},
    {"step_number":5,"title":"Decision","description":"Typically within 15 days."}
  ]',
  '["Any mismatch between form and documents.","Weak or unclear ties to Nigeria.","Thin or unexplained bank activity.","Visa valid 6 months from issue: must be used within that window."]',
  '2026-08-01'
),
(
  'visa', 'US', 'tourist', 'US B1/B2 Visitor Visa',
  185, 'USD', 30, 400,
  '[
    {"key":"passport","label":"Nigerian passport, 6+ months beyond stay","description":"","required":true},
    {"key":"ds160","label":"DS-160 confirmation page","description":"Barcode must match interview appointment.","required":true},
    {"key":"mrv_fee","label":"MRV fee receipt ($185)","description":"Paid via First Bank of Nigeria.","required":true},
    {"key":"photo","label":"US-spec passport photo","description":"","required":true},
    {"key":"prior_visas","label":"Any previous US visas (copies)","description":"","required":false},
    {"key":"funds","label":"Supporting financial evidence","description":"Bank statements, employer letter, or sponsor documents.","required":true}
  ]',
  '[
    {"step_number":1,"title":"Complete DS-160","description":"Official CEAC site."},
    {"step_number":2,"title":"Pay MRV fee","description":"Keep the transaction number."},
    {"step_number":3,"title":"Schedule interview","description":"Via USTravelDocs."},
    {"step_number":4,"title":"Attend interview","description":"Lagos or Abuja."},
    {"step_number":5,"title":"Decision","description":"Given at the interview."}
  ]',
  '["Interview backlog can run 7-13 months.","Any DS-160 vs supporting-document mismatch is a top refusal driver.","Section 214(b) refusal is the most common outcome for first-timers.","Approval rate for Nigerian applicants runs roughly 45%."]',
  '2026-08-01'
),
(
  'visa', 'Canada', 'tourist', 'Canada Temporary Resident Visa',
  100, 'CAD', 42, 98,
  '[
    {"key":"passport","label":"Valid passport","description":"","required":true},
    {"key":"form","label":"IMM 5257 application form","description":"Via the IRCC online portal.","required":true},
    {"key":"photo","label":"Passport photos","description":"","required":true},
    {"key":"funds","label":"Proof of funds for the trip","description":"","required":true},
    {"key":"ties","label":"Proof of ties to Nigeria","description":"Property, tenancy, family or employment.","required":true},
    {"key":"biometrics","label":"Biometrics (fingerprints + photo)","description":"Mandatory, valid 10 years.","required":true}
  ]',
  '[
    {"step_number":1,"title":"Apply online","description":"Through IRCC."},
    {"step_number":2,"title":"Pay & get BIL","description":"Biometric Instruction Letter."},
    {"step_number":3,"title":"Book biometrics","description":"VFS Global: book immediately, slots fill fast."},
    {"step_number":4,"title":"IRCC processing","description":"After biometrics on file."},
    {"step_number":5,"title":"Passport submission & stamping","description":"If a Passport Acceptance Letter is issued."}
  ]',
  '["Nigerian applicants face elevated financial-proof scrutiny.","Biometrics appointments fill quickly.","Total realistic timeline is 8-16 weeks.","A medical exam may be required depending on stay length."]',
  '2026-08-01'
),
(
  'visa', 'UAE', 'tourist', 'UAE (Dubai) e-Visa',
  125, 'USD', 3, 10,
  '[
    {"key":"passport","label":"Nigerian passport, 6+ months validity","description":"Clear scan of biodata + relevant pages.","required":true},
    {"key":"photo","label":"Recent front-facing photo","description":"","required":true},
    {"key":"dvn","label":"Document Verification Number (DVN)","description":"From documentverificationhub.ae, required first.","required":true},
    {"key":"bank","label":"6-month bank statement","description":"","required":true},
    {"key":"hotel","label":"Hotel booking confirmation","description":"","required":true},
    {"key":"flight","label":"Flight itinerary","description":"","required":true}
  ]',
  '[
    {"step_number":1,"title":"Get DVN","description":"Document Verification Hub, required before anything else."},
    {"step_number":2,"title":"Submit visa application","description":"With DVN and documents."},
    {"step_number":3,"title":"Pay visa fee","description":"Varies by duration/entry type."},
    {"step_number":4,"title":"Processing","description":"3-10 working days."},
    {"step_number":5,"title":"Visa issued","description":"Delivered electronically."}
  ]',
  '["No visa-on-arrival for Nigerians, even with a valid US/UK/Schengen/Canada visa.","Any mismatch between entered travel details and passport is a top rejection trigger.","Declare cash above AED 60,000 at customs.","DVN must clear before the visa application can be submitted."]',
  '2026-08-01'
);
