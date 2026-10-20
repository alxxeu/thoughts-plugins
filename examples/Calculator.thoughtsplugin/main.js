// Calculator for Thoughts: math and unit conversions, no network.

// Up to 4 decimals, no trailing zeros: 21.1111, 152.4, 36.
function format(n) {
  if (!isFinite(n)) return null
  if (Math.abs(n) >= 1e15) return n.toExponential(4)
  return String(Math.round(n * 1e4) / 1e4)
}

// --- Math: a small parser, no eval -------------------------------------------

function parse(text) {
  var src = text.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".")
  var pos = 0

  function peek() { while (src[pos] === " ") pos++; return src[pos] }
  function eat(ch) { if (peek() === ch) { pos++; return true } return false }

  function number() {
    peek()
    var m = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(pos))
    if (!m) throw new Error("number")
    pos += m[0].length
    return parseFloat(m[0])
  }
  function primary() {
    if (eat("(")) { var v = expr(); if (!eat(")")) throw new Error(")"); return v }
    if (src.slice(pos).trim().startsWith("sqrt")) {
      pos = src.indexOf("sqrt", pos) + 4
      return Math.sqrt(primary())
    }
    if (eat("-")) return -primary()
    return number()
  }
  function postfix() {
    var v = primary()
    if (eat("%")) v = v / 100
    return v
  }
  function power() {
    var v = postfix()
    if (eat("^")) v = Math.pow(v, power())
    return v
  }
  function term() {
    var v = power()
    for (;;) {
      if (eat("*")) v *= power()
      else if (eat("/")) v /= power()
      else return v
    }
  }
  function expr() {
    var v = term()
    for (;;) {
      if (eat("+")) v += term()
      else if (eat("-")) v -= term()
      else return v
    }
  }

  var value = expr()
  if (peek() !== undefined) throw new Error("rest")
  return value
}

thoughts.converter("math", {
  convert(line) {
    // "15% of 80"
    var of = /^(\d+(?:[.,]\d+)?)\s*%\s*of\s+(\d+(?:[.,]\d+)?)$/i.exec(line)
    if (of) return format(parseFloat(of[1].replace(",", ".")) * parseFloat(of[2].replace(",", ".")) / 100)

    // Only something that looks like math: digits and at least one operator.
    if (!/^[\d\s.,+\-*/×÷()^%]+$|sqrt/.test(line)) return null
    // Dates and phone-like numbers are not math: 2024-10-20, 20.10.2024, 123-45-67.
    if (/^\d+([-.\/])\d+\1\d+$/.test(line)) return null
    if (!/[+\-*/×÷^%]|sqrt/.test(line.replace(/^-/, ""))) return null
    try { return format(parse(line)) } catch (e) { return null }
  }
})

// --- Units --------------------------------------------------------------------

var units = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, inch: 0.0254, inches: 0.0254, ft: 0.3048, foot: 0.3048, feet: 0.3048, yd: 0.9144, mi: 1609.344, mile: 1609.344, miles: 1609.344 },
  weight: { mg: 0.001, g: 1, kg: 1000, t: 1e6, oz: 28.349523125, lb: 453.59237, lbs: 453.59237 },
  volume: { ml: 0.001, l: 1, cl: 0.01, dl: 0.1, tsp: 0.00492892, tbsp: 0.0147868, cup: 0.236588, cups: 0.236588, pt: 0.473176, qt: 0.946353, gal: 3.78541 },
  data: { b: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12, kib: 1024, mib: 1048576, gib: 1073741824 }
}

function toCelsius(value, unit) {
  if (unit === "c") return value
  if (unit === "f") return (value - 32) * 5 / 9
  if (unit === "k") return value - 273.15
}
function fromCelsius(value, unit) {
  if (unit === "c") return value
  if (unit === "f") return value * 9 / 5 + 32
  if (unit === "k") return value + 273.15
}

thoughts.converter("units", {
  convert(line) {
    var m = /^(-?\d+(?:[.,]\d+)?)\s*([a-z°]+)\s+(?:in|to|=)\s+([a-z°]+)$/i.exec(line)
    if (!m) return null
    var value = parseFloat(m[1].replace(",", "."))
    var from = m[2].toLowerCase().replace("°", ""), to = m[3].toLowerCase().replace("°", "")

    if (/^[cfk]$/.test(from) && /^[cfk]$/.test(to)) {
      return format(fromCelsius(toCelsius(value, from), to)) + " °" + to.toUpperCase()
    }
    for (var kind in units) {
      var table = units[kind]
      if (table[from] && table[to]) return format(value * table[from] / table[to]) + " " + m[3]
    }
    return null
  }
})
