const Boss = require('../models/boss.js')

const controller = {}

// ----- Save Boss -----
controller.regBoss = async (req, res) => {
  try {
    const data = { fullname , address , email, password , phone , direction, time_activation } = req.body

    let boss = await Boss.getBoss(data)
    // console.log(boss)

    if (boss.code == 200)
      res
        .status(500)
        .json({ message: "Boss already registered", status: false , code: 500})

    else if (boss.code == 404) {
      userBoss = await Boss.regBoss(data)
      res.status(userBoss.code).json(userBoss)
    }

  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Edit Boss -----
controller.editBoss = async (req, res) => {
  try {
    const data = { id_boss , fullname , address , email , password , phone , direction } = req.body

    userBoss = await Boss.editBoss(data)
    res.status(userBoss.code).json(userBoss)
  
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Delete Boss -----
controller.deleteBoss = async (req, res) => {
  try {
    const data = {id_boss , activation_status} = req.params
    userBoss = await Boss.deleteBoss(data)
    res.status(userBoss.code).json(userBoss)
  
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Save Tasa -----
controller.regTasa = async (req, res) => {
  try {
    const { tasa } = req.body

    data = await Boss.regTasaIva(tasa)
    res.status(data.code).json(data)
    
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Save Tasa -----
controller.getTasa = async (req, res) => {
  try {
    data = await Boss.getTasaIva()
    res.status(data.code).json(data)
    
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}


module.exports = controller
