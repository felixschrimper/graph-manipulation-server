import { getShapesAsGeoJSON, advancedQuery, execRawQuery } from "gtfs"

export async function shapes(req, res) {
  console.log("shapes")
  const { routeId } = req.query

  var sqlQuery = {}
  if (routeId) {
    sqlQuery = { route_id: routeId }
  }

  try {
    var result = await getShapesAsGeoJSON(sqlQuery)
    console.log("shapes done")

    res.json({
      shapes: result,
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

export async function insertShape(tripId, shapeId) {
  console.log("insertShape")
  const advancedQueryOptions = {
    query: { "stop_times.trip_id": tripId },
    fields: ["stops.stop_lat", "stops.stop_lon", "stop_times.stop_sequence"],
    join: [
      {
        type: "INNER",
        table: "stop_times",
        on: "stop_times.stop_id=stops.stop_id",
      },
    ],
    orderBy: [["stop_times.stop_sequence", "ASC"]],
  }

  var stopCoordinates = await advancedQuery("stops", advancedQueryOptions)

  await execRawQuery(
    `INSERT INTO shapes
        (shape_id, shape_pt_lat, shape_pt_lon, shape_pt_sequence)
        VALUES ` +
      stopCoordinates.map((sC) => {
        return `('${shapeId}', ${sC.stop_lat}, ${sC.stop_lon}, ${sC.stop_sequence})`
      }) +
      `;`,
  )
}
