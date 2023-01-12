import { advancedQuery, execRawQuery } from "gtfs"
import lodash from "lodash"
const { groupBy, pick } = lodash

export async function stopTimes(req, res) {
  const { tripId, routeId, serviceId, shapeId } = req.query
  var sqlQuery = {}
  if (routeId) {
    console.log("stopTimes Route")
    sqlQuery.route_id = routeId
  }
  if (serviceId) {
    console.log("stopTimes Service")
    const newServiceId = serviceId.replace("hashtag", "#").replace("plus", "+")
    sqlQuery.service_id = newServiceId
  }
  if (shapeId) {
    console.log("shapeId Shape")
    sqlQuery.shape_id = shapeId
  }
  if (tripId) {
    console.log("tripId Trip")
    sqlQuery = { "trips.trip_id": tripId }
  }

  try {
    if (!routeId && !serviceId && !shapeId && !tripId) {
      res.json({
        stopTimes: [],
      })
      return
    }
    const advancedQueryOptions = {
      query: sqlQuery,
      fields: [
        "stop_times.stop_id",
        "stop_times.stop_sequence",
        "stop_times.arrival_time",
        "stop_times.departure_time",
        "stops.stop_name",
        "trips.trip_id",
        "trips.service_id",
        "trips.direction_id",
        "trips.route_id",
        "trips.shape_id",
      ],
      join: [
        {
          type: "INNER",
          table: "trips",
          on: "stop_times.trip_id=trips.trip_id",
        },
        {
          type: "INNER",
          table: "stops",
          on: "stop_times.stop_id=stops.stop_id",
        },
      ],
      orderBy: [
        ["stop_times.stop_sequence", "ASC"],
        ["stop_times.arrival_time", "ASC"],
      ],
    }

    var result = await advancedQuery("stop_times", advancedQueryOptions)

    result = Object.values(groupBy(result, "trip_id")).map((trip) => {
      return {
        trip_id: trip[0].trip_id,
        service_id: trip[0].service_id,
        direction_id: trip[0].direction_id,
        route_id: trip[0].route_id,
        shape_id: trip[0].shape_id,
        stops: trip.map((stop) =>
          pick(stop, [
            "stop_id",
            "stop_name",
            "stop_sequence",
            "arrival_time",
            "departure_time",
          ]),
        ),
      }
    })

    console.log("stopTimes Route/Service done")

    res.json({
      stopTimes: result,
    })
  } catch (e) {
    console.log(e)
  }
}

export async function insertStopTimes(tripId, stops) {
  console.log("insertStopTimes")
  console.log(stops)
  await execRawQuery(
    `
    INSERT INTO stop_times
    (trip_id, arrival_time, departure_time, stop_id, stop_sequence)
    VALUES ` +
      stops.map((s) => {
        return `
        ('${s.tripId ?? tripId}', 
        '${s.arrival_time}', 
        '${s.departure_time}', 
        '${s.stop_id}', 
        ${s.stop_sequence})`
      }) +
      `;`,
  )
}

export async function deleteStopTimes(tripId) {
  console.log("deleteStopTimes")
  await execRawQuery(`DELETE FROM stop_times WHERE trip_id = '${tripId}'`)
}
