import { Maybe } from "true-myth"

const maybe = Maybe.of("foo")

const r = maybe.map((str) => str.length)

console.log(r.unwrapOr(null))
