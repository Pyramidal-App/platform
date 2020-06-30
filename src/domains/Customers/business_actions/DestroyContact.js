import BusinessAction from '$src/BusinessAction'
import { Contact, Task, Address, Note, CustomersPhoneNumber, Interaction } from '$src/models'

class DestroyContact extends BusinessAction {
  async isAllowed() {
    const contact = await this._getContact()
    return contact.UserId === this.performer.id
  }

  async executePerform() {
    const transaction = this.transaction
    const contact = await this._getContact()
    const CustomerId = contact.id

    await Task.destroy({ where: { CustomerId }, transaction })
    await Address.destroy({ where: { CustomerId }, transaction })
    await Note.destroy({ where: { CustomerId }, transaction })
    await CustomersPhoneNumber.destroy({ where: { CustomerId }, transaction })
    await Interaction.destroy({ where: { CustomerId }, transaction })
    await contact.destroy({ transaction })
  }

  async _getContact() {
    if (!this._contact) {
      const pk = this.params.contactId.match(/^\d+/)[0]
      this._contact = Contact.findByPk(pk, { transaction: this.transaction })
    }

    return await this._contact
  }
}

export default DestroyContact
