require('dotenv').config()

/* ----------- SERVER ----------- */
const PORT                      = process.env.PORT

/* ----------- DATABASE ----------- */
const PG_HOST                   = process.env._HOST
const PG_USER                   = process.env._USER
const PG_PASS                   = process.env._PASS
const PG_NAME                   = process.env._NAME

/* ----------- ROUTES ----------- */

// Boss
const GET_ADMINS                = process.env.GET_ADMINS
const REGISTER_BOSS             = process.env.REGISTER_BOSS
const KEY                       = process.env.KEY
const EDIT_BOSS                 = process.env.EDIT_BOSS
const DELETE_BOSS               = process.env.DELETE_BOSS

const REG_IVA               = process.env.REG_IVA
const IVA               = process.env.IVA

module.exports = {
	// Server
  PORT,
  // Database
  PG_HOST, PG_USER, PG_PASS, PG_NAME,
  // Boss
  REGISTER_BOSS, KEY , EDIT_BOSS , DELETE_BOSS, GET_ADMINS, REG_IVA , IVA
}
