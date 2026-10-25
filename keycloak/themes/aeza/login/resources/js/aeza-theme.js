// The panel and Keycloak share the origin (/kc behind the same nginx), so the theme chosen
// with the panel's switch is in localStorage; without it the system setting is used.
(function () {
  var stored = null
  try {
    stored = localStorage.getItem('theme')
  } catch (e) {
    stored = null
  }
  var media = window.matchMedia('(prefers-color-scheme: dark)')
  function apply() {
    var dark = stored ? stored === 'dark' : media.matches
    document.documentElement.classList.toggle('pf-v5-theme-dark', dark)
    document.documentElement.classList.toggle('aeza-dark', dark)
  }
  apply()
  media.addEventListener('change', apply)
})()
