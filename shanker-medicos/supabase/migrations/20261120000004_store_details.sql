-- Store details and offer supplied by the owner on 20 Nov 2026.
-- Only fills values still at their earlier defaults, so edits made in admin are kept.
update public.business_settings set address = 'Dera Road' where id = 1 and address = '';
update public.business_settings set postal_code = '143505' where id = 1 and postal_code = '';
update public.business_settings set phone = '+91 98155 52404' where id = 1 and phone = '';
update public.business_settings set opening_hours = E'Summer: 9:00 am – 10:00 pm\nWinter: 9:30 am – 9:30 pm\nSunday: Closed' where id = 1 and opening_hours = '';
update public.business_settings set offer_percent = 10, offer_code = 'SHANKER10' where id = 1 and offer_percent = 12 and offer_code = 'SHANKER12';
update public.business_settings set club_extra_percent = 5 where id = 1 and club_extra_percent = 0;
alter table public.business_settings alter column offer_percent set default 10;
alter table public.business_settings alter column offer_code set default 'SHANKER10';
alter table public.business_settings alter column club_extra_percent set default 5;
