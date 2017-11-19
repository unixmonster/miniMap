import {
  LOGIC_R, LOGIC_L, MAP, ORG, ORG_UP,
  RIGHT, LEFT, DOWN, UP
} from './constant'
import { logErr } from './util'

export const getOUTS = (ctx) => {
  switch (ctx) {
    case LOGIC_R:
      return [RIGHT]
    case LOGIC_L:
      return [LEFT]
    case ORG:
      return [DOWN]
    case ORG_UP:
      return [UP]
    case MAP:
      return [RIGHT, LEFT]
    default:
      logErr('Unknown ctx', getOUTS, ctx)
  }
}

export const getGroupIN = (ctx) => {
  switch (ctx) {
    case LOGIC_R:
      return LEFT
    case LOGIC_L:
      return RIGHT
    case ORG:
      return UP
    case ORG_UP:
      return DOWN
    default:
      logErr('Unknown ctx', getGroupIN, ctx)
  }
}

export const getGroupDir = (ctx) => {
  switch (ctx) {
    case LOGIC_R:
    case LOGIC_L:
      return DOWN
    case ORG:
    case ORG_UP:
      return RIGHT
    default:
      logErr('Unknown ctx', getGroupDir, ctx)
  }
}

export const getIN = (ctx) => {
  switch (ctx) {
    case LOGIC_R:
      return LEFT
    case LOGIC_L:
      return RIGHT
    case ORG:
      return UP
    case ORG_UP:
      return DOWN
    default:
      logErr('Unknown ctx', getInDir, ctx)
  }
}


export const splitTactic = (arr) => {
  const rightNum = Math.ceil(arr.length / 2)
  const right = arr.slice(0, rightNum)
  const left = arr.slice(rightNum)
  return [right, left]
}