// req.body ko zod schema se check karta hai. Fail hone par 400 + exact
// field/reason batata hai - generic "bad request" nahi, taaki frontend
// (aur debugging) ko pata chale kya galat gaya
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const issue = result.error.issues[0]
      const field = issue.path.join('.') || 'body'
      return res.status(400).json({
        success: false,
        message: `Invalid ${field}: ${issue.message}`,
      })
    }

    // Parsed data wapas assign karo - unknown keys strip ho jaate hain
    // (zod ka default), aur coerced values (jaise z.coerce.number()) bhi
    // yahi se aage jaate hain
    req.body = result.data
    next()
  }
}

module.exports = { validate }
