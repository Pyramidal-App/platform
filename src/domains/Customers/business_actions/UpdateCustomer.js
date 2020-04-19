import BusinessAction from '$src/BusinessAction'
import { Customer, CustomersPhoneNumber, PhoneNumber } from '$src/models'

class UpdateCustomer extends BusinessAction {
  validationConstraints = {
    id: { presence: true },
    name: { presence: true }
  }

  async isAllowed () {
    const customer = await this._customer()
    return customer.UserId === this.performer.id
  }

  async executePerform () {
    const { name, phoneNumbers = [] } = this.params
    const transaction = this.transaction
    const customer = await this._customer()

    await customer.update({ name })

    debugger

    for (const {
      id,
      countryCode,
      areaCode,
      number,
      delete: DELETE
    } of phoneNumbers) {
      if (id) {
        await this._removePhoneNumber(customer.id, id)

        if (!DELETE) {
          await this._addPhoneNumber(customer.id, countryCode, areaCode, number)
        }
      } else {
        await this._addPhoneNumber(customer.id, countryCode, areaCode, number)
      }
    }

    return customer
  }

  async _addPhoneNumber (customerId, countryCode, areaCode, number) {
    const transaction = this.transaction
    const [phoneNumber] = await PhoneNumber.findOrCreate({
      where: { countryCode, areaCode, number },
      transaction
    })
    return await CustomersPhoneNumber.findOrCreate({
      where: { CustomerId: customerId, PhoneNumberId: phoneNumber.id },
      transaction
    })
  }

  async _removePhoneNumber (customerId, phoneNumberId) {
    return await CustomersPhoneNumber.destroy(
      { where: { CustomerId: customerId, PhoneNumberId: phoneNumberId } },
      { transaction: this.transaction }
    )
  }

  async _customer () {
    if (!this.__customer) {
      this.__customer = Customer.findByPk(this.params.id, {
        transaction: this.transaction
      })
    }
    return await this.__customer
  }
}

export default UpdateCustomer
