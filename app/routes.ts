import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  layout('./nav/shell.tsx', [index('./routes/home.tsx')]),
  route('/login', './auth/login.tsx'),
] satisfies RouteConfig;
