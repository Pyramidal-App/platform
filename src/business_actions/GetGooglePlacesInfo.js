import { Op } from 'sequelize'
import subDays from 'date-fns/subDays'

import BusinessAction from '$src/BusinessAction'
import { PhoneNumber, GooglePlace } from '$src/models'
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js'
import difference from 'lodash.difference'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const REQUESTED_FIELDS = ['place_id', 'international_phone_number', 'geometry']
const PHONE_NUMBER_REGEX = /\+(?<countryCode>\d+)\s+(?<areaCode>\d+)\s+(?<rawNumber>[\d|\-]+)/
const ONLY_NUMBERS_REGEX= /\d+/g
const CACHE_TIMEOUT_IN_DAYS = 30

/**
 * Interacts with Google Maps API to retrive the phone number for a list of places.
 * Results are cached for a time simply using the updatedAt timestamp to limit the API usage.
 */
class GetGooglePlacesInfo extends BusinessAction {
  async executePerform() {
    const { googlePlaceIds } = this.params

    const cachedPlaces = await this.getCachedPlaces(googlePlaceIds)
    const cachedGooglePlaceIds = cachedPlaces.map(gp => gp.googlePlaceId)
    const nonCachedGooglePlaceIds = difference(googlePlaceIds, cachedGooglePlaceIds)

    const nonCachedPlaces =
      nonCachedGooglePlaceIds
        .map(this.getGooglePlacePhoneNumber.bind(this))
        |> Promise.all(#)
        |> await(#)

    return [...cachedPlaces, ...nonCachedPlaces]
  }

  async getCachedPlaces(googlePlaceIds) {
    const thresholdDate = subDays(new Date(), CACHE_TIMEOUT_IN_DAYS)

    return await GooglePlace.findAll({
      where: {
        googlePlaceId: googlePlaceIds,
        [Op.and]: [
          { lastQueriedFromGoogleAt: { [Op.ne]: null } },
          { lastQueriedFromGoogleAt: { [Op.gt]: thresholdDate } }
        ]
      },
      include: [{ model: PhoneNumber }],
      transaction: this.transaction
    })
  }

  async getGooglePlacePhoneNumber(googlePlaceId) {
    const transaction = this.transaction

    const googlePlaceInfo = await this.fetchGooglePlaceInfo(googlePlaceId)
    const phoneNumber = await this.findOrCreatePhoneNumber(googlePlaceInfo)
    const [googlePlace] = await GooglePlace.findOrBuild({ where: { googlePlaceId }, transaction })

    if (phoneNumber) { googlePlace.PhoneNumberId = phoneNumber.id }

    googlePlace.lat = googlePlaceInfo.geometry.location.lat
    googlePlace.lng = googlePlaceInfo.geometry.location.lng
    googlePlace.lastQueriedFromGoogleAt = new Date()

    await googlePlace.save({ transaction })

    return googlePlace
  }

  async fetchGooglePlaceInfo(googlePlaceId) {
    const params = {
      place_id: googlePlaceId,
      fields: REQUESTED_FIELDS,
      key: GOOGLE_MAPS_API_KEY
    }

    const response = await this.googleMapsClient().placeDetails({ params })

    return response.data.result
  }

  async findOrCreatePhoneNumber(googlePlaceInfo) {
    const internationalPhoneNumber = googlePlaceInfo.international_phone_number

    if (!internationalPhoneNumber) { return null }

    const match = PHONE_NUMBER_REGEX.exec(internationalPhoneNumber)

    if (!match) { return null }

    const { groups: { countryCode, areaCode, rawNumber } } = match

    const number = rawNumber.match(ONLY_NUMBERS_REGEX).join('')

    const [phoneNumber] = await PhoneNumber.findOrCreate({
      where: { countryCode, areaCode, number },
      transaction: this.transaction
    })

    return phoneNumber
  }

  googleMapsClient() {
    if (!this._googleMapsClient) {
      this._googleMapsClient = new GoogleMapsClient({})
    }

    return this._googleMapsClient
  }
}

export default GetGooglePlacesInfo
