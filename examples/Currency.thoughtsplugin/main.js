// Currency for Thoughts: daily European Central Bank rates via frankfurter.app.
// Rates are cached for 12 hours in the plugin's storage.

var TWELVE_HOURS = 12 * 60 * 60 * 1000

async function rate(from, to) {
  var key = from + ":" + to
  var cached = thoughts.storage.get(key)
  if (cached && Date.now() - cached.time < TWELVE_HOURS) return cached.rate

  var response = await thoughts.fetch("https://api.frankfurter.app/latest?from=" + from + "&to=" + to)
  if (!response.ok) return null
  var value = response.json().rates[to]
  if (typeof value !== "number") return null
  thoughts.storage.set(key, { rate: value, time: Date.now() })
  return value
}

thoughts.converter("currency", {
  async convert(line) {
    var m = /^(\d+(?:[.,]\d+)?)\s*([a-z]{3})\s+(?:in|to)\s+([a-z]{3})$/i.exec(line)
    if (!m) return null
    var from = m[2].toUpperCase(), to = m[3].toUpperCase()
    if (from === to) return null
    var r = await rate(from, to)
    if (r == null) return null
    var amount = parseFloat(m[1].replace(",", ".")) * r
    return amount.toFixed(2) + " " + to
  }
})
