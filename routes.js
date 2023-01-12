import express from "express"
import { agencies } from "./Controllers/agencies.js"
import { stops, stopsGeoJSON, addStop } from "./Controllers/stops.js"
import { exportgtfs, fetchgtfs } from "./Controllers/gtfs.js"
import { routes, addRoute, deleteRoute } from "./Controllers/routes.js"
import { shapes } from "./Controllers/shapes.js"
import { trips, addTrip, deleteTrips } from "./Controllers/trips.js"
import { calendars, editCalendar } from "./Controllers/calendars.js"
import {
  calendarDates,
  editCalendarDates,
} from "./Controllers/calendarDates.js"
import { stopTimes } from "./Controllers/stoptimes.js"
import { test } from "./Controllers/test.js"

export const router = express.Router()

router.get("/", (req, res) => {
  res.json({
    "": "Graph Manipulation Server",
  })
})

router.post("/gtfs/fetch", fetchgtfs)
router.get("/gtfs/export", exportgtfs)

router.get("/agencies", agencies)

router.get("/stops", stops)
router.post("/stops", addStop)
router.get("/stopsGeoJSON", stopsGeoJSON)

router.get("/stopTimes", stopTimes)

router.get("/routes", routes)
router.post("/routes", addRoute)
router.delete("/routes", deleteRoute)

router.get("/trips", trips)
router.post("/trips", addTrip)
router.delete("/trips", deleteTrips)

router.get("/calendars", calendars)
router.post("/calendars", editCalendar)
router.get("/calendarDates", calendarDates)
router.post("/calendarDates", editCalendarDates)

router.get("/shapes", shapes)

router.get("/test", test)

export default router
