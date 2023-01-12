import { getRoutes, execRawQuery, runRawQuery } from "gtfs"
import { v4 as uuidv4 } from "uuid"

export async function routes(req, res) {
  console.log("routes")
  const { stopId } = req.query

  try {
    var sqlQuery = {}
    if (stopId) {
      sqlQuery = { stop_id: stopId }
      var result = await getRoutes(sqlQuery, [], [])
    } else {
      var result = await runRawQuery(`
      SELECT DISTINCT 
        r.route_id, 
        r.route_short_name, 
        r.route_long_name, 
        r.route_type, 
        r.route_color, 
        r.route_text_color, 
        c.start_date, 
        c.end_date
      FROM routes r
      LEFT JOIN trips t
      ON t.route_id = r.route_id
      LEFT JOIN calendar c
      ON c.service_id = t.service_id 
      ORDER BY r.route_short_name, c.start_date
      `)
    }
    console.log(result.length)

    console.log("routes done")

    res.json({
      routes: result,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

export async function addRoute(req, res) {
  console.log("addRoute")

  let {
    route_id,
    route_short_name,
    route_long_name,
    route_type,
    route_color,
    route_text_color,
  } = req.body

  var id = ""
  var insertQuery = ""

  if (route_id) {
    console.log("update Route")
    id = route_id
    insertQuery = `
    UPDATE routes 
    SET route_short_name = '${route_short_name}', 
      route_long_name = '${route_long_name}',  
      route_type = ${route_type},  
      route_color = '${route_color}',  
      route_text_color = '${route_text_color}' 
    WHERE route_id = '${id}';`
  } else {
    console.log("insert Route")
    var id = uuidv4()
    var insertQuery = `
    INSERT  
    INTO routes (route_id, route_short_name, route_long_name, route_type, route_color, route_text_color) 
    VALUES ('${id}', '${route_short_name}', '${route_long_name}', ${route_type} , '${route_color}', '${route_text_color}');`
  }

  try {
    await execRawQuery(insertQuery)
    var select = await getRoutes({ route_id: id })

    console.log("addRoute done")

    res.json({ route: select })
  } catch (e) {
    console.log(e)
  }
}

export async function deleteRoute(req, res) {
  console.log("deleteRoute")

  let { routeId } = req.body

  try {
    const deleteRoute = `DELETE FROM routes WHERE routes.route_id = '${routeId}';`
    await execRawQuery(deleteRoute)
    const selectTrips = `SELECT trip_id FROM trips WHERE trips.route_id = '${routeId}';`
    const trips = await runRawQuery(selectTrips)
    const tripsString = trips
      .map((tripId) => "'" + tripId.trip_id + "'")
      .toString()

    const deleteTrips = `DELETE FROM trips WHERE trips.route_id = '${routeId}';`
    const deleteStopTimes = `DELETE FROM stop_times WHERE stop_times.trip_id IN (${tripsString});`

    await execRawQuery(deleteTrips)
    await execRawQuery(deleteStopTimes)

    console.log("deleteRoute done")

    res.json({ removed: true })
  } catch (e) {
    console.log(e)
  }
}
