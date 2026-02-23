import { defineMiddleware } from 'astro:middleware';
import { createSSRClient, createServiceClient } from '@lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  // Only guard /admin/* routes, skip /admin/login
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return next();
  }

  const supabase = createSSRClient({
    request: context.request,
    cookies: context.cookies,
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return context.redirect('/admin/login');
  }

  const serviceClient = createServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return context.redirect('/admin/login');
  }

  context.locals.user = user;
  context.locals.profile = profile;

  return next();
});
