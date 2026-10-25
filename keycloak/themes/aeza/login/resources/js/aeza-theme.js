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

// Keycloak asks for a passkey name and refuses a second key with the same name. Suggest a unique
// one (device and time) and keep it when the dialog is cancelled or left empty.
(function () {
  var DEFAULT_LABELS = ['Ключ доступа', 'Passkey']
  var nativePrompt = window.prompt.bind(window)

  function deviceName() {
    var ua = navigator.userAgent
    if (/iPhone|iPad/.test(ua)) return 'iPhone'
    if (/Android/.test(ua)) return 'Android'
    if (/Mac OS X/.test(ua)) return 'Mac'
    if (/Windows/.test(ua)) return 'Windows'
    if (/Linux/.test(ua)) return 'Linux'
    return ''
  }

  window.prompt = function (message, value) {
    if (DEFAULT_LABELS.indexOf(value) === -1) return nativePrompt(message, value)
    var when = new Date().toLocaleString(document.documentElement.lang || undefined, {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    var unique = [value, deviceName(), when].filter(Boolean).join(' · ')
    var answer = nativePrompt(message, unique)
    return answer && answer.trim() ? answer.trim() : unique
  }
})()
