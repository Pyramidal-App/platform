import CreateCustomer from './business_actions/CreateCustomer'
import UpdateCustomer from './business_actions/UpdateCustomer'
import SearchCustomers from './business_actions/SearchCustomers'
import DestroyContact from './business_actions/DestroyContact'

const Customers = {
  create: CreateCustomer,
  update: UpdateCustomer,
  search: SearchCustomers,
  destroy: DestroyContact
}

export default Customers
