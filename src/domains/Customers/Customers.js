import CreateCustomer from './business_actions/CreateCustomer'
import UpdateCustomer from './business_actions/UpdateCustomer'
import SearchCustomers from './business_actions/SearchCustomers'

const Customers = {
  create: CreateCustomer,
  update: UpdateCustomer,
  search: SearchCustomers
}

export default Customers
