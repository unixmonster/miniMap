import { posAdd, mapFlat, isDef, rand } from './util'
import { isTopic, Conn, createTok, isGroup, isPhantom } from './tok'
import { TOPIC, GROUP, BRANCH, CONN } from './constant'
import { calGroup, calBranch, getTopicJoint } from './layoutUtil'
import { createRect, createPath,  createGroup, createText, createG } from '../lib/svg'
import { STRUCT_MAP, CONN_GAP, DEFAULT_STYLE } from './config'


//  =========== calTok ===========

export const calTok = (tok) => {
  switch (tok.type) {
    case TOPIC:
      return tok
    case GROUP:
      tok.elts.forEach(calTok)
      calGroup(tok)
      return tok
    case BRANCH:
      tok.elts.forEach(calTok)
      calBranch(tok)
      return tok
    default:
      logErr('Unexpect tok.type', calTok, tok)
  }
}

// =========== exposeConn ===========

export const exposeConn = (tok) => {
  const conns = []

  const getInPosArr = (tok) => {
    switch (tok.type) {
      case TOPIC:
        return [{ tok, pos: tok.getJoint() }]
      case GROUP:
        return mapFlat(tok.elts, getInPosArr)
      case BRANCH:
        const topic = tok.getTopic()
        const pos1 = { tok, pos: tok.getJoint() }
        const pos2 = { tok: topic, pos: topic.getJoint() }
        // the path from branch's joint connect to topic
        conns.push(new Conn(pos1, pos2))
        return [pos1]
    }
  }

  const iter = (tok) => {
    switch (tok.type) {
      case TOPIC:
        break
      case GROUP: {
        tok.elts.forEach(iter)
        break
      }
      case BRANCH: {
        const { OUTS, LineStyle } = STRUCT_MAP[tok.struct]
        const [topic, ...others] = tok.elts
        others.forEach(iter)
        others.forEach((t, i) => {
          const dir = OUTS[i]
          const topicOutPos = { tok: topic, pos: getTopicJoint(topic, dir) }
          const branchOutPos = { tok: topic, pos: getTopicJoint(topic, dir, CONN_GAP) }
          const inPosArr = getInPosArr(t)
          // create lines
          conns.push(new Conn(topicOutPos, branchOutPos, { dir }))
          inPosArr.forEach((inPos) => {
            conns.push(new Conn(branchOutPos, inPos, { dir, style: LineStyle }))
          })
        })
      }
      default:
        // TODO log error
    }
  }

  iter(tok)
  return conns
}

//  =========== imposeTok ===========

export const imposeTok = (node, i = 0) => {
  if (Array.isArray(node)) { return node.forEach((child) => imposeTok(child, i)) }

  const index =  Math.min(i, DEFAULT_STYLE.length - 1)
  const defaultStyle = DEFAULT_STYLE[index]
  const tok = createTok(node, defaultStyle)
  node.tok = tok
  node.children && node.children.forEach((child) => imposeTok(child, i + 1))
  return node
}

// =========== flattenBranch ===========

export const flattenBranch = (tok) => {

  const iter = (tok, pos) => {
    tok.pos = posAdd(tok.pos, pos)
    tok.parent = null
    if (isTopic(tok)) { return [tok] }
    else {
      const toks = mapFlat(tok.elts, (t) => iter(t, tok.pos))
      if (isGroup(tok) && !isPhantom(tok)) { return [tok, ...toks] }
      else { return toks }
    }
  }

  const originPos = { x: 0, y: 0 }
  return iter(tok, originPos)
}

// =========== render ===========

export const render = (toks) => {

  const elms = mapFlat(toks, (tok) => {
    switch (tok.type) {
      case TOPIC:
        return [createRect(tok), createText(tok)]
      case GROUP:
        return [createGroup(tok)]
      case CONN:
        return [createPath(tok)]
      default:
        return
    }
  })

  const g = createG(elms)
  return g
}
