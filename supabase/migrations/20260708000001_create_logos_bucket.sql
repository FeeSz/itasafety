insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Logos Public Access"
on storage.objects for select
to public
using ( bucket_id = 'logos' );

create policy "Admin Users can insert logos"
on storage.objects for insert
with check (
  bucket_id = 'logos'
  and exists (
    select 1
    from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

create policy "Admin Users can update logos"
on storage.objects for update
using (
  bucket_id = 'logos'
  and exists (
    select 1
    from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);

create policy "Admin Users can delete logos"
on storage.objects for delete
using (
  bucket_id = 'logos'
  and exists (
    select 1
    from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'admin'
  )
);
