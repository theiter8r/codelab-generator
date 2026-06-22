-- Public storage bucket for lab cover images and in-content uploads.
insert into storage.buckets (id, name, public)
values ('lab-assets', 'lab-assets', true)
on conflict (id) do nothing;

-- Anyone can read assets (public bucket); only admins can upload/modify/delete.
create policy "lab_assets_public_read" on storage.objects
  for select using (bucket_id = 'lab-assets');

create policy "lab_assets_admin_insert" on storage.objects
  for insert with check (bucket_id = 'lab-assets' and is_admin());

create policy "lab_assets_admin_update" on storage.objects
  for update using (bucket_id = 'lab-assets' and is_admin())
  with check (bucket_id = 'lab-assets' and is_admin());

create policy "lab_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'lab-assets' and is_admin());
