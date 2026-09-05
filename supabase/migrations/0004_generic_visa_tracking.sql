-- Lets every one of the 193 countries become a trackable, saved
-- application, not just the handful with a dedicated researched guide.
-- Multiple applications can now share one application_type_id (the
-- generic visa type below), distinguished by destination_country.
alter table applications add column if not exists destination_country text;

-- One shared row used for every country that doesn't have its own
-- dedicated, fully researched application_type.
insert into application_types
  (category, destination, visa_subtype, display_name, fee_amount, fee_currency,
   processing_time_min_days, processing_time_max_days, document_requirements, process_steps, common_pitfalls, last_verified_date)
select
  'visa', null, 'generic', 'Visa Application', null, null, null, null,
  '[
    {"key":"passport","label":"Valid passport (6+ months)","description":"","required":true},
    {"key":"photos","label":"Passport photographs","description":"Per the destination''s own spec.","required":true},
    {"key":"form","label":"Completed application form","description":"","required":true},
    {"key":"funds","label":"Proof of funds","description":"","required":true},
    {"key":"itinerary","label":"Proof of accommodation / itinerary","description":"","required":true}
  ]',
  '[]',
  '["Document inconsistencies are the most common rejection reason worldwide.","Confirm exact requirements on the destination''s official embassy or consulate site. They vary by country and change often.","Never pay a third party claiming to guarantee approval."]',
  current_date
where not exists (select 1 from application_types where category = 'visa' and visa_subtype = 'generic');

-- France and Ghana already had fully researched static guides in the app
-- (src/lib/countries.ts FULL_DATA) but, unlike UK/US/Canada/UAE, weren't
-- backed by a real trackable application row. Adding that now so they
-- match the same tier as the original four.
insert into application_types
  (category, destination, visa_subtype, display_name, fee_amount, fee_currency,
   processing_time_min_days, processing_time_max_days, document_requirements, process_steps, common_pitfalls, last_verified_date)
select 'visa', 'France', 'tourist', 'France (Schengen) Visitor Visa', 90, 'EUR', 15, 45,
  '[
    {"key":"passport","label":"Nigerian passport, 6+ months validity, issued within 10 years","description":"2+ blank pages.","required":true},
    {"key":"photos","label":"2 recent colour photos, 35x45mm","description":"","required":true},
    {"key":"form","label":"Completed Schengen application form","description":"Via france-visas.gouv.fr.","required":true},
    {"key":"bank","label":"Bank statements, last 3 months","description":"","required":true},
    {"key":"insurance","label":"Schengen travel insurance","description":"Minimum EUR 30,000 coverage.","required":true},
    {"key":"flight","label":"Confirmed round-trip flight reservation","description":"","required":true}
  ]',
  '[]',
  '["Nigerian Schengen applications face closer scrutiny and a meaningfully higher rejection rate.","Never book non-refundable flights or make non-refundable payments before the visa is issued.","Book your VFS appointment 4 to 8 weeks ahead, slots fill fast in peak season.","Schengen isn''t one process, apply through whichever member country is your main destination."]',
  '2026-08-01'
where not exists (select 1 from application_types where destination = 'France');

insert into application_types
  (category, destination, visa_subtype, display_name, fee_amount, fee_currency,
   processing_time_min_days, processing_time_max_days, document_requirements, process_steps, common_pitfalls, last_verified_date)
select 'visa', 'Ghana', 'tourist', 'Ghana Travel Checklist (Visa-Free, ECOWAS)', null, null, null, null,
  '[
    {"key":"passport","label":"Valid Nigerian passport (or ECOWAS Travel Certificate)","description":"","required":true},
    {"key":"yellow_fever","label":"Yellow fever vaccination card","description":"The one hard entry requirement.","required":true},
    {"key":"return_proof","label":"Return / onward travel proof","description":"","required":true}
  ]',
  '[]',
  '["No visa application needed, Nigerians travel visa-free under ECOWAS for stays up to 90 days.","Airlines enforce their own passport-validity minimums even where immigration doesn''t.","Flights and applications surge October to December (Detty December), book that window early."]',
  '2026-08-01'
where not exists (select 1 from application_types where destination = 'Ghana');
