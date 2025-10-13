export default function ({ $auth, redirect, route }) {
  if (!$auth.loggedIn && route.path !== '/auth/login') {
    return redirect('/auth/login')
  }
}
