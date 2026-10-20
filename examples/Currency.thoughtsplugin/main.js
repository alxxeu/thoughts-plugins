// Currency for Thoughts, like Spotlight: "100 usd in eur", "100 usd eur",
// "100usd" (to your own currency), "$100", "100€ to gbp".
// Rates: open.er-api.com (ExchangeRate-API, daily, no key), cached 12 hours.

var TWELVE_HOURS = 12 * 60 * 60 * 1000

var codes = ("AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BRL BSD BTN BWP BYN BZD " +
  "CAD CDF CHF CLP CNY COP CRC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD GNF GTQ " +
  "GYD HKD HNL HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KRW KWD KYD KZT LAK LBP LKR LRD LSL " +
  "LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MYR MZN NAD NGN NIO NOK NPR NZD OMR PAB PEN PGK PHP PKR " +
  "PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SOS SRD SSP STN SYP SZL THB TJS TMT TND TOP TRY " +
  "TTD TWD TZS UAH UGX USD UYU UZS VES VND VUV WST XAF XCD XOF XPF YER ZAR ZMW ZWL").split(" ")

var symbols = { "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY", "₽": "RUB", "֏": "AMD", "₴": "UAH", "₸": "KZT",
                "₺": "TRY", "₹": "INR", "₩": "KRW", "₫": "VND", "₾": "GEL", "zł": "PLN", "฿": "THB" }

function currency(token) {
  if (!token) return null
  if (symbols[token]) return symbols[token]
  var code = token.toUpperCase()
  return codes.indexOf(code) >= 0 ? code : null
}

async function rates(base) {
  var cached = thoughts.storage.get(base)
  if (cached && Date.now() - cached.time < TWELVE_HOURS) return cached.rates
  var response = await thoughts.fetch("https://open.er-api.com/v6/latest/" + base)
  if (!response.ok) return null
  var data = response.json()
  if (data.result !== "success") return null
  thoughts.storage.set(base, { rates: data.rates, time: Date.now() })
  return data.rates
}

function format(amount, code) {
  var locale = (thoughts.locale && thoughts.locale.identifier || "en_US").replace("_", "-")
  var digits = amount >= 100 ? 0 : 2
  try {
    return amount.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " " + code
  } catch (e) {
    return amount.toFixed(digits) + " " + code
  }
}

var symbolClass = "[$€£¥₽֏₴₸₺₹₩₫₾฿]|zł"
var number = "(\\d+(?:[.,]\\d+)?)"
var token = "(" + symbolClass + "|[a-z]{3})"
// "100 usd", "100usd", "$100", "100$" + optional ["in"|"to"] target
var pattern = new RegExp("^(?:" + number + "\\s*" + token + "|" + token + "\\s*" + number + ")" +
                         "(?:\\s+(?:(?:in|to)\\s+)?([a-z]{3}|" + symbolClass + "))?$", "i")

thoughts.converter("currency", {
  async convert(line) {
    var m = pattern.exec(line)
    if (!m) return null
    var amount = parseFloat((m[1] || m[4]).replace(",", "."))
    var from = currency(m[2] || m[3])
    var to = m[5] ? currency(m[5]) : currency(thoughts.locale && thoughts.locale.currency)
    if (!from || !to || from === to) return null
    var table = await rates(from)
    if (!table || typeof table[to] !== "number") return null
    return format(amount * table[to], to)
  }
})
