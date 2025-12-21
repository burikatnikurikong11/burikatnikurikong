interface CardDimensions {
  width: number
  height: number
}

interface MarkerPosition {
  x: number
  y: number
}

interface ViewportDimensions {
  width: number
  height: number
}

export interface CardPosition {
  transform: string
  transformOrigin: string
}

const CARD_OFFSET = 20
const EDGE_THRESHOLD = 0.35

export function calculateCardPosition(
  markerPos: MarkerPosition,
  cardDimensions: CardDimensions,
  viewportDimensions: ViewportDimensions,
  scale: number = 1
): CardPosition {
  const scaledWidth = cardDimensions.width * scale
  const scaledHeight = cardDimensions.height * scale

  const normalizedX = markerPos.x / viewportDimensions.width
  const normalizedY = markerPos.y / viewportDimensions.height

  const isLeft = normalizedX < EDGE_THRESHOLD
  const isRight = normalizedX > (1 - EDGE_THRESHOLD)
  const isTop = normalizedY < EDGE_THRESHOLD
  const isBottom = normalizedY > (1 - EDGE_THRESHOLD)

  let translateX = '-50%'
  let translateY = `calc(-100% - ${CARD_OFFSET + 50}px)`
  let transformOrigin = 'center bottom'

  if (isTop && isLeft) {
    translateX = '0'
    translateY = `${CARD_OFFSET}px`
    transformOrigin = 'top left'
  } else if (isTop && isRight) {
    translateX = '-100%'
    translateY = `${CARD_OFFSET}px`
    transformOrigin = 'top right'
  } else if (isTop && !isLeft && !isRight) {
    translateX = '-50%'
    translateY = `${CARD_OFFSET}px`
    transformOrigin = 'top center'
  } else if (isBottom && isLeft) {
    translateX = '0'
    translateY = `calc(-100% - ${CARD_OFFSET}px)`
    transformOrigin = 'bottom left'
  } else if (isBottom && isRight) {
    translateX = '-100%'
    translateY = `calc(-100% - ${CARD_OFFSET}px)`
    transformOrigin = 'bottom right'
  } else if (isBottom && !isLeft && !isRight) {
    translateX = '-50%'
    translateY = `calc(-100% - ${CARD_OFFSET}px)`
    transformOrigin = 'bottom center'
  } else if (isLeft && !isTop && !isBottom) {
    translateX = '0'
    translateY = `calc(-100% - ${CARD_OFFSET + 50}px)`
    transformOrigin = 'center left'
  } else if (isRight && !isTop && !isBottom) {
    translateX = '-100%'
    translateY = `calc(-100% - ${CARD_OFFSET + 50}px)`
    transformOrigin = 'center right'
  }

  return {
    transform: `translate(${translateX}, ${translateY}) scale(${scale})`,
    transformOrigin
  }
}
