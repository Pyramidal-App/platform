import BusinessAction from '$src/BusinessAction'
import { Note } from '$src/models'

class DeleteNote extends BusinessAction {
  async executePerform() {
    const { noteId } = this.params
    const transaction = this.transaction

    await Note.destroy({
      where: {
        UserId: this.performer.id,
        id: noteId
      }
    }, { transaction })
  }
}

export default DeleteNote
