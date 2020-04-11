import { Op } from 'sequelize'

import { Task } from '$src/models'
import Search, { where } from '$src/Search'

import visibleToUser from '$src/Search/search_filters/visibleToUser'
import opFilter from '$src/Search/search_filters/opFilter'

/**
 * Encapsulates logic related to tasks filtering.
 *
 * @extends {BusinessAction}
 */
class SearchTasks extends Search {
  model = Task

  isAllowed () {
    const userId = this.params.filters.assignedToUser
    return userId && userId === this.performer.id
  }

  filters = {
    assignedToUser: opFilter('UserId'),
    customerId: opFilter('CustomerId'),
    status: opFilter('status'),
    taskType: opFilter('taskType'),
    minCreatedAt: opFilter('createdAt', Op.gte),
    maxCreatedAt: opFilter('createdAt', Op.lte),
    minDueDate: opFilter('dueDate', Op.gte),
    maxDueDate: opFilter('dueDate', Op.lte),
  }
}

export default SearchTasks
