import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  layout('./nav/shell.tsx', [
    index('./routes/home.tsx'),
    ...prefix('land-valuation-requests', [
      index('./lvrs/list.tsx'),
      route(':id', './lvrs/details.tsx'),
      route('new', './lvrs/new.tsx'),
      route(':id/delete', './lvrs/delete.tsx'),
    ]),
  ]),
  route('/login', './auth/login.tsx'),
  route('/logout', './auth/logout.tsx'),
] satisfies RouteConfig;
