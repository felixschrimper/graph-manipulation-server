import { getTrips, execRawQuery, advancedQuery } from "gtfs"
import { v4 as uuidv4 } from "uuid"
import { insertCalendar } from "./calendars.js"
import { insertCalendarDates } from "./calendarDates.js"
import { insertStopTimes, deleteStopTimes } from "./stopTimes.js"
import { insertShape } from "./shapes.js"

export async function trips(req, res) {
  console.log("trips")
  const { routeId } = req.query
  var sqlQuery = {}
  if (routeId) {
    sqlQuery = { route_id: routeId }
  }

  try {
    var result = await getTrips(sqlQuery, [], [])

    console.log("trips done")

    res.json({
      trips: result,
    })
  } catch (e) {
    console.log(e)
  }
}

async function insertTrips(
  tripIds,
  route_id,
  serviceId,
  shapeId,
  direction_id,
) {
  console.log("insertTrips")
  console.log(tripIds)
  await execRawQuery(
    `INSERT INTO trips 
      (trip_id, route_id, service_id, shape_id, direction_id) 
      VALUES ` +
      tripIds.map((tripId) => {
        return `('${tripId}', '${route_id}', '${serviceId}', '${shapeId}' , ${direction_id})`
      }) +
      `;`,
  )
}

async function updateTrip(route_id, service_id, shapeId, direction_id, tripId) {
  console.log("updateTrip")
  console.log(route_id, service_id, shapeId, direction_id, tripId)
  await execRawQuery(
    `UPDATE trips 
    SET route_id = '${route_id}', service_id = '${service_id}', shape_id = '${shapeId}', direction_id = ${direction_id}
    WHERE trip_id = '${tripId}';`,
  )
}

function addAdditionOnTime(time, addition) {
  var [hours, minutes] = time.split(":")
  hours = parseInt(hours)
  minutes = parseInt(minutes)
  hours = (hours + parseInt((minutes + addition) / 60)).toString()
  minutes = ((minutes + addition) % 60).toString()

  while (hours.length < 2) hours = "0" + hours
  while (minutes.length < 2) minutes = "0" + minutes
  return `${hours}:${minutes}`
}

function addStopFrequency(frequency, stops, tripIds, stopsToAdd) {
  let addition = frequency.timeInterval
  let endTime = parseInt(frequency.endTime.replace(":", ""))
  while (
    parseInt(
      addAdditionOnTime(stops[0].arrival_time, addition).replace(":", ""),
    ) <= endTime
  ) {
    let newTripId = uuidv4()
    tripIds.push(newTripId)
    stops.forEach((stop) => {
      let newStop = {
        ...stop,
        arrival_time: addAdditionOnTime(stop.arrival_time, addition),
        departure_time: addAdditionOnTime(stop.departure_time, addition),
        tripId: newTripId,
      }
      stopsToAdd.push(newStop)
    })
    addition = addition + frequency.timeInterval
  }
}

export async function addTrip(req, res) {
  console.log("addTrip")

  let { mode, tripStopTimes, calendar, calendar_dates, frequency } = req.body
  let { service_id } = calendar
  let { route_id, direction_id } = tripStopTimes[0]

  var serviceId = service_id ? service_id : uuidv4()
  var shapeId = uuidv4()

  console.log(mode)
  try {
    if (mode === "addTrip" || mode === "addTrips") {
      var tripIds = [uuidv4()]
      let { stops } = tripStopTimes[0]
      var stopsToAdd = []

      if (mode === "addTrip") {
        stopsToAdd = stops
      } else if (mode === "addTrips") {
        stopsToAdd = [...stops]
        if (frequency.on && frequency.timeInterval !== 0 && stops.length > 0) {
          addStopFrequency(frequency, stops, tripIds, stopsToAdd)
        }
      }

      await insertTrips(tripIds, route_id, serviceId, shapeId, direction_id)
      if (stopsToAdd.length > 0) {
        await insertStopTimes(tripIds[0], stopsToAdd)
        await insertShape(tripIds[0], shapeId)
      }
    } else if (mode === "editTrip" || mode === "editTrips") {
      for (const tripStopTime of tripStopTimes) {
        let { trip_id, stops } = tripStopTime

        await updateTrip(route_id, serviceId, shapeId, direction_id, trip_id)
        await deleteStopTimes(trip_id)
        if (stops.length > 0) {
          await insertStopTimes(trip_id, stops)
          await insertShape(trip_id, shapeId)
        }
      }
    }

    if (!service_id) {
      await insertCalendar(serviceId, calendar)
      await insertCalendarDates(serviceId, calendar_dates)
    }

    console.log("addTrip done")

    res.json({ routeId: route_id })
  } catch (e) {
    console.log(e)
  }
}

export async function deleteTrips(req, res) {
  console.log("deleteTrips")

  var tripString = req.body.map((tripId) => "'" + tripId + "'").toString()

  const deleteTrip = `DELETE FROM trips WHERE trip_id IN (${tripString});`
  const delteStopTimes = `DELETE FROM stop_times WHERE trip_id IN (${tripString});`

  try {
    await execRawQuery(deleteTrip)
    await execRawQuery(delteStopTimes)

    console.log("deleteTrips done")

    res.json({ removed: true })
  } catch (e) {
    console.log(e)
  }
}
