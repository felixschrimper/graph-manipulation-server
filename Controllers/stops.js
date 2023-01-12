import { getStops, getStopsAsGeoJSON, execRawQuery, runRawQuery } from "gtfs"
import { v4 as uuidv4 } from "uuid"

export async function stops(req, res) {
  console.log("stops")
  const { routeId } = req.query
  var sqlQuery = {}
  if (routeId) {
    sqlQuery = { route_id: routeId }
  }

  try {
    var result = await getStops(sqlQuery, [], [["stop_name", "ASC"]])

    console.log("stops done")

    res.json({
      stops: result,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

export async function stopsGeoJSON(req, res) {
  console.log("stopsGeoJSON")
  const { routeId } = req.query
  var sqlQuery = {}
  if (routeId) {
    sqlQuery = { route_id: routeId }
  }

  try {
    var result = await getStopsAsGeoJSON(sqlQuery, [], [])

    console.log("stopsGeoJSON done")

    res.json({
      stops: result,
    })
  } catch (e) {
    console.log(e)
  }
}

export async function addStop(req, res) {
  console.log("addStop")
  let { stop_id, stop_name, stop_lat, stop_lon, stop_url } = req.body

  var id = ""
  var query = ""

  if (stop_id) {
    console.log("update Stop")
    id = stop_id
    query = `
      UPDATE stops 
      SET stop_name = '${stop_name}', stop_lat = ${stop_lat},  stop_lon = ${stop_lon} 
      WHERE stop_id = '${stop_id}';`
  } else {
    var id = uuidv4()
    var query = `INSERT INTO stops (stop_id, stop_name, stop_lat, stop_lon, stop_url) 
      VALUES ('${id}', '${stop_name}', ${stop_lat}, ${stop_lon}, '${stop_url}');`
  }

  try {
    await execRawQuery(query)

    var select = await runRawQuery(
      `SELECT * FROM stops WHERE stop_id = '${id}'`,
    )

    console.log("addStop done")

    res.json({ stop: select })
  } catch (e) {
    console.log(e)
  }
}
