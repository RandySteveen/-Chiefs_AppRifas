const pool        = require('../utils/mysql.connect.js') 
const bcrypt      = require("bcrypt")
const jwt         = require("jsonwebtoken")
const { KEY }     = require('../global/_var.js')

// ----- Register Boss -----
const getBoss = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "User not found",
      code: 404
    }

    const connection = await pool.getConnection()

    let sql = `SELECT id_boss FROM chiefs WHERE email = ? ;`
    const [boss] = await connection.execute(sql,[email])

    let sql0 = `SELECT id_boss FROM sellers WHERE email = ? ;`
    const [seller] = await connection.execute(sql0,[email])

    if (boss.length > 0 || seller.length > 0) {
      msg = {
        status: true,
        message: "Email found",
        dataBoss: boss,
        dataSeller: seller,
        code: 200
      }
    }
    
    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Save Boss -----
const regBoss = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Boss not registered",
      code: 500
    }
    
    const connection = await pool.getConnection()
    
    const hash = await bcrypt.hash(password, 10)    


    const fechaActual = new Date();
    const date_created = fechaActual.toISOString().split('T')[0];

    // Calcula la fecha de expiración sumando 'time_activation' días a la fecha actual
    const expirationDate = new Date(fechaActual.getTime() + time_activation * 24 * 60 * 60 * 1000);
    const expiration_date = expirationDate.toISOString().split('T')[0]; // Formatea la fecha de expiración a 'yyyy-MM-dd'

    let tokenLic = {
      emailAdmin: email,
      timeLicense: time_activation,
      date_create: date_created,
      date_expires: expiration_date
    }

    const token = jwt.sign(tokenLic, KEY, { algorithm: "HS256" })

    let sql = `INSERT INTO chiefs (fullname , address , email, password, phone, direction, permit_level, date_created , activation_status) VALUES (?, ?, ?, ?, ? , ? , ?, ?, ?) `
    const [boss] = await connection.execute(sql,[fullname, address, email, hash, phone, direction, 1, date_created, 1])

    // Obtener el ID del último registro insertado
    const lastInsertId = boss.insertId;

    let sqlLic = `INSERT INTO licenses (id_boss , license , date_created , activation_status) VALUES (?, ?, ? , 1) `
    const [license] = await connection.execute(sqlLic,[lastInsertId , token , date_created])

    if (boss.affectedRows > 0 && license.affectedRows > 0) {
      msg = {
        status: true,
        message: "Boss registered succesfully",
        code: 200
      }
    }

    connection.release()

    return msg

  } catch (err) {
    console.log(err)
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Edit Boss -----
const editBoss = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Boss not edited",
      code: 500
    }
    
    const connection = await pool.getConnection()

    let sql = `SELECT id_boss , email FROM chiefs WHERE id_boss = ? ;`
    let [verify] = await connection.execute(sql,[id_boss])

    if (verify.length > 0) {

      let sqlLic = `SELECT license FROM licenses WHERE id_boss = ? ;`
      let [result] = await connection.execute(sqlLic,[id_boss])

      let lic = result[0].license

      jwt.verify (lic, KEY , async (err, decoded) => {
        if(err) throw err

        if(email != decoded.emailAdmin){

          let newToken = {
            emailAdmin: email,
            timeLicense: decoded.timeLicense,
            date_create: decoded.date_create,
            date_expires: decoded.date_expires
          }
                      
          const token = jwt.sign(newToken, KEY, { algorithm: "HS256" })
  
          let sql = `UPDATE licenses SET license = ? WHERE id_boss = ? ;`;
          await connection.execute(sql, [token, id_boss]);  
        }
      })

      const hash = await bcrypt.hash(password, 10)    

      let sql = `UPDATE chiefs SET fullname = ? , address = ?, email = ? , password = ? , phone = ? , direction = ? WHERE id_boss = ? ;`;
      const [boss] =  await connection.execute(sql, [fullname, address, email, hash, phone, direction, id_boss]);

      if (boss.affectedRows > 0) {
        msg = {
          status: true,
          message: "Boss edited succesfully",
          code: 200
        }
      }
    }
    connection.release()

    return msg

  } catch (err) {
    console.log(err)
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Delete Boss -----
const deleteBoss = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Boss not deleted",
      code: 500
    }
    
    const connection = await pool.getConnection()

    
    let sql = `SELECT id_boss FROM chiefs WHERE id_boss = ? ;`
    let [verify] = await connection.execute(sql,[id_boss])

    if (verify.length > 0) {

      let updateSql = `UPDATE chiefs SET activation_status = ? WHERE id_boss = ?;`;
      const boss =  await connection.execute(updateSql, [activation_status , id_boss])

      if (boss.length > 0 && activation_status == 1) {

        let updateSeller = `UPDATE sellers SET activation_status = ? WHERE id_boss = ?;`;
        await connection.execute(updateSeller, [activation_status , id_boss])

        let updateLicense = `UPDATE licenses SET activation_status = ? WHERE id_boss = ?;`;
        await connection.execute(updateLicense, [activation_status , id_boss])

        msg = {
          status: true,
          message: "Boss Activated succesfully",
          code: 200
        }
      }else if (boss.length > 0 && activation_status == 0) {

        let updateSeller = `UPDATE sellers SET activation_status = ? WHERE id_boss = ?;`;
        await connection.execute(updateSeller, [activation_status , id_boss])

        let updateLicense = `UPDATE licenses SET activation_status = ? WHERE id_boss = ?;`;
        await connection.execute(updateLicense, [activation_status , id_boss])

        msg = {
          status: true,
          message: "Boss Disabled succesfully",
          code: 200
        }
      }
    }

    connection.release()

    return msg

  } catch (err) {
    console.log(err)
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Get Sellers -----
const getAdmins = async () => {
  try {
    let msg = {
      status: false,
      message: "Admins not found",
      code: 404
    }

    const connection = await pool.getConnection()

    let sql = `SELECT chiefs.id_boss, chiefs.fullname, chiefs.address, chiefs.email, chiefs.phone, chiefs.direction , chiefs.date_created , chiefs.permit_level , chiefs.activation_status , licenses.license FROM chiefs 
    INNER JOIN licenses ON licenses.id_boss = chiefs.id_boss ;`
    let [admins] = await connection.execute(sql)

    if (admins.length > 0) {
      msg = {
        status: true,
        message: "Admins found",
        data: admins,
        code: 200
      }
    }

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Save Tasa Iva -----
const regTasaIva = async (tasa) => {
  try {
    let msg = {
      status: false,
      message: "Tasa not registered",
      code: 500
    }
    
    const connection = await pool.getConnection()

    const fechaActual = new Date();
    const date_created = fechaActual.toISOString().split('T')[0];

    let sql = `INSERT INTO tasaIva (tasa , date_created) VALUES (?, ?) `
    const [result] = await connection.execute(sql,[tasa , date_created])

    if (result.affectedRows > 0) {
      msg = {
        status: true,
        message: "Tasa Iva registered succesfully",
        code: 200
      }
    }

    connection.release()

    return msg

  } catch (err) {
    console.log(err)
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Get Tasa Iva -----
const getTasaIva = async () => {
  try {
    let msg = {
      status: false,
      message: "Tasa not found",
      code: 404
    }

    const connection = await pool.getConnection()

    let sql = `SELECT tasa, date_created
    FROM tasaIva
    ORDER BY date_created DESC
    LIMIT 1;;`
    let [tasa] = await connection.execute(sql)

    if (tasa.length > 0) {
      msg = {
        status: true,
        message: "tasa found",
        data: tasa,
        code: 200
      }
    }

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

module.exports = {
  getBoss,
  regBoss,
  regTasaIva,
  getTasaIva,
  editBoss,
  deleteBoss,
  getAdmins
}
