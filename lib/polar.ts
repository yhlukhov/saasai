import {createPolar, createPolarCore} from '@polar-sh/sdk/2026-10'

export const polarCore = createPolarCore({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  environment: 'sandbox'
})

export const polar = createPolar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  environment: 'sandbox',
})