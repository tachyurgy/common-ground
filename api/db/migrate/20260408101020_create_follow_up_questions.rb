class CreateFollowUpQuestions < ActiveRecord::Migration[8.1]
  def change
    create_table :follow_up_questions do |t|
      t.references :agreement, null: false, foreign_key: true
      t.text :question
      t.text :context
      t.boolean :skipped
      t.boolean :answered

      t.timestamps
    end
  end
end
