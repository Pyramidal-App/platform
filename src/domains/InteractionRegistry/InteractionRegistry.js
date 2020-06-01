import SearchInteractionRegistry from './businessActions/SearchInteractionRegistry'
import CreateInteraction from './businessActions/CreateInteraction'

const InteractionRegistry = {
  search: SearchInteractionRegistry,
  createInteraction: CreateInteraction
}

export default InteractionRegistry
